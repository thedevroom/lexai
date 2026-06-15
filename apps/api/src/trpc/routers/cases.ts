import { AuditAction, CasePriority, CaseStatus, LegalArea, TimelineEventType } from '@prisma/client';
import { z } from 'zod';
import { logAudit } from '../../lib/audit.js';
import { getOwnedCase } from '../../lib/case-access.js';
import { createRouter, protectedProcedure } from '../trpc.js';

const legalAreaSchema = z.nativeEnum(LegalArea);
const caseStatusSchema = z.nativeEnum(CaseStatus);
const casePrioritySchema = z.nativeEnum(CasePriority);

export const casesRouter = createRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          status: caseStatusSchema.optional(),
          legalArea: legalAreaSchema.optional(),
          limit: z.number().int().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const cases = await ctx.prisma.case.findMany({
        where: {
          userId: ctx.user.id,
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.legalArea ? { legalArea: input.legalArea } : {}),
        },
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          deadlines: {
            where: { status: 'PENDING' },
            orderBy: { dueDate: 'asc' },
            take: 3,
          },
          _count: {
            select: {
              consultations: true,
              documents: true,
              deadlines: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (cases.length > limit) {
        const next = cases.pop();
        nextCursor = next?.id;
      }

      return { cases, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.id, ctx.user.id);

      return ctx.prisma.case.findUnique({
        where: { id: input.id },
        include: {
          deadlines: { orderBy: { dueDate: 'asc' }, take: 10 },
          timelineEvents: { orderBy: { occurredAt: 'desc' }, take: 20 },
          _count: {
            select: {
              consultations: true,
              documents: true,
              legalDocuments: true,
              voiceSessions: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        description: z.string().max(5000).optional(),
        legalArea: legalAreaSchema,
        priority: casePrioritySchema.default(CasePriority.MEDIUM),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const caseRecord = await ctx.prisma.case.create({
        data: {
          userId: ctx.user.id,
          title: input.title,
          ...(input.description !== undefined ? { description: input.description } : {}),
          legalArea: input.legalArea,
          priority: input.priority,
          status: CaseStatus.ACTIVE,
        },
      });

      await ctx.prisma.timelineEvent.create({
        data: {
          caseId: caseRecord.id,
          type: TimelineEventType.CASE_CREATED,
          title: 'Expediente creado',
          description: `Expediente "${input.title}" creado en área ${input.legalArea}`,
        },
      });

      await logAudit(ctx.prisma, {
        userId: ctx.user.id,
        action: AuditAction.CREATE,
        resource: 'case',
        resourceId: caseRecord.id,
        metadata: { legalArea: input.legalArea, title: input.title },
        ipAddress: ctx.meta.ip,
        userAgent: ctx.meta.userAgent,
      });

      return caseRecord;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(3).max(200).optional(),
        description: z.string().max(5000).optional(),
        status: caseStatusSchema.optional(),
        priority: casePrioritySchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.id, ctx.user.id);

      const { id, title, description, status, priority } = input;
      const updated = await ctx.prisma.case.update({
        where: { id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(priority !== undefined ? { priority } : {}),
          ...(status === CaseStatus.CLOSED ? { closedAt: new Date() } : {}),
        },
      });

      await ctx.prisma.timelineEvent.create({
        data: {
          caseId: id,
          type: TimelineEventType.CASE_UPDATED,
          description: 'Expediente actualizado',
        },
      });

      return updated;
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.id, ctx.user.id);

      return ctx.prisma.case.update({
        where: { id: input.id },
        data: { status: CaseStatus.ARCHIVED },
      });
    }),
});