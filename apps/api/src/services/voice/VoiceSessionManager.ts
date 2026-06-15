import {
  AuditAction,
  ConsentType,
  type Prisma,
  TimelineEventType,
  VoiceSessionStatus,
  type PrismaClient,
} from '@prisma/client';
import { logAudit } from '../../lib/audit.js';
import { prismaLegalAreaToShared } from '../../lib/legal-area-map.js';
import { buildRoomName, createLiveKitToken, getLiveKitConfig } from './livekit.js';
import { processTranscriptToSummary, type TranscriptSegment } from './transcription-pipeline.js';
import { getTwilioConfig } from './twilio.js';

export interface CreateVoiceSessionParams {
  caseId: string;
  userId: string;
  ip?: string | null;
  userAgent?: string | null;
}

export interface JoinTokenResult {
  token: string;
  roomName: string;
  livekitUrl: string;
  sessionId: string;
}

export class VoiceSessionManager {
  constructor(private readonly prisma: PrismaClient) {}

  async assertVoiceConsent(userId: string): Promise<void> {
    const consent = await this.prisma.consentRecord.findUnique({
      where: {
        userId_type: { userId, type: ConsentType.VOICE_RECORDING },
      },
    });

    if (!consent?.granted) {
      throw new Error(
        'Se requiere consentimiento de grabación de voz (VOICE_RECORDING) antes de iniciar una sesión',
      );
    }
  }

  async createSession(params: CreateVoiceSessionParams) {
    await this.assertVoiceConsent(params.userId);

    const caseRecord = await this.prisma.case.findFirst({
      where: { id: params.caseId, userId: params.userId },
      select: { id: true, title: true },
    });

    if (!caseRecord) {
      throw new Error('Expediente no encontrado');
    }

    const session = await this.prisma.voiceSession.create({
      data: {
        caseId: params.caseId,
        status: VoiceSessionStatus.SCHEDULED,
      },
    });

    const roomName = buildRoomName(params.caseId, session.id);

    await this.prisma.voiceSession.update({
      where: { id: session.id },
      data: { livekitRoomId: roomName },
    });

    await this.prisma.timelineEvent.create({
      data: {
        caseId: params.caseId,
        type: TimelineEventType.VOICE_SESSION_STARTED,
        description: `Sesión de voz programada: ${caseRecord.title}`,
        metadata: { sessionId: session.id, roomName },
      },
    });

    await logAudit(this.prisma, {
      userId: params.userId,
      action: AuditAction.CREATE,
      resource: 'voice_session',
      resourceId: session.id,
      metadata: { caseId: params.caseId, roomName },
      ...(params.ip ? { ipAddress: params.ip } : {}),
      ...(params.userAgent ? { userAgent: params.userAgent } : {}),
    });

    return { ...session, livekitRoomId: roomName };
  }

  async getJoinToken(
    sessionId: string,
    userId: string,
    participantName?: string,
  ): Promise<JoinTokenResult> {
    const session = await this.prisma.voiceSession.findUnique({
      where: { id: sessionId },
      include: { case: { select: { userId: true } } },
    });

    if (session?.case.userId !== userId) {
      throw new Error('Sesión de voz no encontrada');
    }

    const livekit = getLiveKitConfig();
    if (!livekit) {
      throw new Error('LiveKit no configurado');
    }

    const roomName = session.livekitRoomId ?? buildRoomName(session.caseId, session.id);

    const token = await createLiveKitToken({
      roomName,
      participantIdentity: userId,
      ...(participantName ? { participantName } : {}),
    });

    await this.prisma.voiceSession.update({
      where: { id: sessionId },
      data: {
        status: VoiceSessionStatus.CONNECTING,
        startedAt: new Date(),
      },
    });

    return {
      token,
      roomName,
      livekitUrl: livekit.url,
      sessionId,
    };
  }

  async endSession(sessionId: string, userId: string, durationSeconds?: number) {
    const session = await this.prisma.voiceSession.findUnique({
      where: { id: sessionId },
      include: { case: { select: { userId: true } } },
    });

    if (session?.case.userId !== userId) {
      throw new Error('Sesión de voz no encontrada');
    }

    return this.prisma.voiceSession.update({
      where: { id: sessionId },
      data: {
        status: VoiceSessionStatus.COMPLETED,
        endedAt: new Date(),
        ...(durationSeconds !== undefined ? { duration: durationSeconds } : {}),
      },
    });
  }

  async saveTranscriptAndSummary(
    sessionId: string,
    userId: string,
    segments: TranscriptSegment[],
  ) {
    const session = await this.prisma.voiceSession.findUnique({
      where: { id: sessionId },
      include: { case: { select: { userId: true, legalArea: true } } },
    });

    if (session?.case.userId !== userId) {
      throw new Error('Sesión de voz no encontrada');
    }

    const segmentsJson = segments as unknown as Prisma.InputJsonValue;

    await this.prisma.voiceTranscript.upsert({
      where: { voiceSessionId: sessionId },
      create: {
        voiceSessionId: sessionId,
        segments: segmentsJson,
        language: 'es',
      },
      update: {
        segments: segmentsJson,
      },
    });

    const summaryResult = await processTranscriptToSummary({
      caseId: session.caseId,
      legalArea: prismaLegalAreaToShared(session.case.legalArea),
      segments,
    });

    const actionsJson = summaryResult.actions as unknown as Prisma.InputJsonValue;
    const metadataJson = {
      modelUsed: summaryResult.modelUsed,
      processingMs: summaryResult.processingMs,
    } as unknown as Prisma.InputJsonValue;

    await this.prisma.postCallSummary.upsert({
      where: { voiceSessionId: sessionId },
      create: {
        voiceSessionId: sessionId,
        summary: summaryResult.summary,
        actions: actionsJson,
        metadata: metadataJson,
      },
      update: {
        summary: summaryResult.summary,
        actions: actionsJson,
        metadata: metadataJson,
      },
    });

    await this.prisma.timelineEvent.create({
      data: {
        caseId: session.caseId,
        type: TimelineEventType.VOICE_SESSION_ENDED,
        description: 'Transcripción procesada y resumen post-llamada generado',
        metadata: { sessionId, modelUsed: summaryResult.modelUsed },
      },
    });

    await logAudit(this.prisma, {
      userId,
      action: AuditAction.CREATE,
      resource: 'voice_transcript',
      resourceId: sessionId,
      metadata: { segmentCount: segments.length },
    });

    return summaryResult;
  }

  getProviderStatus() {
    return {
      livekit: Boolean(getLiveKitConfig()),
      twilio: Boolean(getTwilioConfig()),
    };
  }
}