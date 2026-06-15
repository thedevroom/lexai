import { z } from 'zod';
import { getOwnedCase } from '../../lib/case-access.js';
import { getLiveKitConfig } from '../../services/voice/livekit.js';
import { getTwilioConfig } from '../../services/voice/twilio.js';
import { VoiceSessionManager } from '../../services/voice/VoiceSessionManager.js';
import type { TranscriptSegment } from '../../services/voice/transcription-pipeline.js';
import { throwBadRequest, throwNotFound } from '../errors.js';
import { createRouter, protectedProcedure } from '../trpc.js';

const transcriptSegmentSchema = z.object({
  speaker: z.enum(['user', 'agent', 'system']),
  text: z.string().min(1),
  startMs: z.number().int().nonnegative().optional(),
  endMs: z.number().int().nonnegative().optional(),
});

export const voiceRouter = createRouter({
  getProviderStatus: protectedProcedure.query(() => ({
    livekit: Boolean(getLiveKitConfig()),
    twilio: Boolean(getTwilioConfig()),
  })),

  listByCase: protectedProcedure
    .input(z.object({ caseId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.caseId, ctx.user.id);

      return ctx.prisma.voiceSession.findMany({
        where: { caseId: input.caseId },
        orderBy: { createdAt: 'desc' },
        include: {
          transcript: { select: { id: true, language: true, createdAt: true } },
          postCallSummary: { select: { id: true, summary: true, createdAt: true } },
        },
      });
    }),

  createSession: protectedProcedure
    .input(z.object({ caseId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.caseId, ctx.user.id);

      const manager = new VoiceSessionManager(ctx.prisma);

      try {
        return await manager.createSession({
          caseId: input.caseId,
          userId: ctx.user.id,
          ip: ctx.meta.ip,
          userAgent: ctx.meta.userAgent,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al crear sesión';
        throwBadRequest(message);
      }
    }),

  getJoinToken: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        participantName: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const manager = new VoiceSessionManager(ctx.prisma);

      try {
        return await manager.getJoinToken(
          input.sessionId,
          ctx.user.id,
          input.participantName,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al generar token';
        throwBadRequest(message);
      }
    }),

  endSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        durationSeconds: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const manager = new VoiceSessionManager(ctx.prisma);

      try {
        return await manager.endSession(
          input.sessionId,
          ctx.user.id,
          input.durationSeconds,
        );
      } catch {
        throwNotFound('Sesión de voz');
      }
    }),

  submitTranscript: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        segments: z.array(transcriptSegmentSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const manager = new VoiceSessionManager(ctx.prisma);

      try {
        const segments: TranscriptSegment[] = input.segments.map((s) => ({
          speaker: s.speaker,
          text: s.text,
          ...(s.startMs !== undefined ? { startMs: s.startMs } : {}),
          ...(s.endMs !== undefined ? { endMs: s.endMs } : {}),
        }));

        return await manager.saveTranscriptAndSummary(
          input.sessionId,
          ctx.user.id,
          segments,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al procesar transcripción';
        throwBadRequest(message);
      }
    }),
});