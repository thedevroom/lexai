import {
  AuditAction,
  ConsultationStatus,
  MessageRole,
  TimelineEventType,
} from '@prisma/client';
import { z } from 'zod';
import { logAudit } from '../../lib/audit.js';
import { getOwnedCase } from '../../lib/case-access.js';
import { prismaLegalAreaToShared } from '../../lib/legal-area-map.js';
import { checkRateLimit } from '../../middleware/rate-limit.js';
import {
  getAiIntegrationStatus,
  processConsultationMessage,
} from '../../services/ai/consultation-ai.js';
import { getSensitiveAreaRateLimit } from '../../services/security/anti-abuse.js';
import { throwNotFound, throwRateLimited } from '../errors.js';
import { createRouter, protectedProcedure } from '../trpc.js';

export const consultationsRouter = createRouter({
  getAiStatus: protectedProcedure.query(() => getAiIntegrationStatus()),

  listByCase: protectedProcedure
    .input(z.object({ caseId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.caseId, ctx.user.id);

      return ctx.prisma.consultation.findMany({
        where: { caseId: input.caseId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { messages: true } },
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const consultation = await ctx.prisma.consultation.findUnique({
        where: { id: input.id },
        include: {
          case: { select: { id: true, userId: true, title: true, legalArea: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!consultation) {
        throwNotFound('Consulta');
      }

      await getOwnedCase(ctx.prisma, consultation.caseId, ctx.user.id);
      return consultation;
    }),

  create: protectedProcedure
    .input(
      z.object({
        caseId: z.string().cuid(),
        topic: z.string().max(500).optional(),
        agentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.caseId, ctx.user.id);

      const caseMeta = await ctx.prisma.case.findUnique({
        where: { id: input.caseId },
        select: { legalArea: true },
      });

      const agentId = input.agentId ?? caseMeta?.legalArea.toLowerCase() ?? null;

      const consultation = await ctx.prisma.consultation.create({
        data: {
          caseId: input.caseId,
          ...(input.topic !== undefined ? { topic: input.topic } : {}),
          agentId,
          status: ConsultationStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });

      await ctx.prisma.timelineEvent.create({
        data: {
          caseId: input.caseId,
          type: TimelineEventType.CONSULTATION_STARTED,
          description: input.topic ?? 'Nueva consulta jurídica iniciada',
        },
      });

      await logAudit(ctx.prisma, {
        userId: ctx.user.id,
        action: AuditAction.CREATE,
        resource: 'consultation',
        resourceId: consultation.id,
        metadata: { caseId: input.caseId },
        ipAddress: ctx.meta.ip,
        userAgent: ctx.meta.userAgent,
      });

      return consultation;
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        consultationId: z.string().cuid(),
        content: z.string().min(1).max(32000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const consultation = await ctx.prisma.consultation.findUnique({
        where: { id: input.consultationId },
        select: {
          id: true,
          caseId: true,
          status: true,
          case: { select: { legalArea: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20,
            select: { role: true, content: true },
          },
        },
      });

      if (!consultation) {
        throwNotFound('Consulta');
      }

      await getOwnedCase(ctx.prisma, consultation.caseId, ctx.user.id);

      const legalAreaId = prismaLegalAreaToShared(consultation.case.legalArea);
      const rateConfig = getSensitiveAreaRateLimit(legalAreaId);
      const rateResult = await checkRateLimit({
        key: `consultation:${legalAreaId}:${ctx.user.id}`,
        limit: rateConfig.limit,
        windowSeconds: rateConfig.windowSeconds,
      });

      if (!rateResult.allowed) {
        throwRateLimited(rateResult.retryAfterSeconds);
      }

      const userMessage = await ctx.prisma.message.create({
        data: {
          consultationId: input.consultationId,
          role: MessageRole.USER,
          content: input.content,
        },
      });

      const history = consultation.messages.map((m) => ({
        role: m.role === MessageRole.ASSISTANT ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

      const aiResult = await processConsultationMessage({
        query: input.content,
        caseId: consultation.caseId,
        legalArea: legalAreaId,
        history,
      });

      const assistantMessage = await ctx.prisma.message.create({
        data: {
          consultationId: input.consultationId,
          role: MessageRole.ASSISTANT,
          content: aiResult.content,
          metadata: aiResult.metadata,
        },
      });

      await ctx.prisma.consultation.update({
        where: { id: input.consultationId },
        data: {
          status: ConsultationStatus.AWAITING_USER,
          summary: aiResult.metadata.legalResponse.diagnostico.slice(0, 500),
        },
      });

      await ctx.prisma.timelineEvent.create({
        data: {
          caseId: consultation.caseId,
          type: TimelineEventType.CONSULTATION_COMPLETED,
          description: `Respuesta IA generada (${aiResult.metadata.aiMode})`,
          metadata: {
            modelUsed: aiResult.metadata.modelUsed,
            areaId: aiResult.metadata.areaId,
          },
        },
      });

      await logAudit(ctx.prisma, {
        userId: ctx.user.id,
        action: AuditAction.CREATE,
        resource: 'consultation_message',
        resourceId: input.consultationId,
        metadata: {
          aiMode: aiResult.metadata.aiMode,
          areaId: aiResult.metadata.areaId,
          modelUsed: aiResult.metadata.modelUsed,
        },
        ipAddress: ctx.meta.ip,
        userAgent: ctx.meta.userAgent,
      });

      return { userMessage, assistantMessage, aiMode: aiResult.metadata.aiMode };
    }),

  listMessages: protectedProcedure
    .input(
      z.object({
        consultationId: z.string().cuid(),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const consultation = await ctx.prisma.consultation.findUnique({
        where: { id: input.consultationId },
        select: { caseId: true },
      });

      if (!consultation) {
        throwNotFound('Consulta');
      }

      await getOwnedCase(ctx.prisma, consultation.caseId, ctx.user.id);

      const messages = await ctx.prisma.message.findMany({
        where: { consultationId: input.consultationId },
        orderBy: { createdAt: 'asc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (messages.length > input.limit) {
        const next = messages.pop();
        nextCursor = next?.id;
      }

      return { messages, nextCursor };
    }),
});