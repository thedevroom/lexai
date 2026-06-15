import { AuditAction, type Prisma, TimelineEventType } from '@prisma/client';
import { z } from 'zod';
import { logAudit } from '../../lib/audit.js';
import { getOwnedCase } from '../../lib/case-access.js';
import { ensureUserDek, encryptBuffer } from '../../services/encryption/envelope.js';
import { uploadEncryptedDocument } from '../../services/storage/r2.js';
import { throwBadRequest, throwNotFound } from '../errors.js';
import { createRouter, protectedProcedure } from '../trpc.js';

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const documentsRouter = createRouter({
  listByCase: protectedProcedure
    .input(z.object({ caseId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.caseId, ctx.user.id);

      return ctx.prisma.document.findMany({
        where: { caseId: input.caseId },
        orderBy: { createdAt: 'desc' },
        include: {
          analysis: {
            select: {
              id: true,
              riskScore: true,
              semaphore: true,
              summary: true,
              analyzedAt: true,
            },
          },
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.findUnique({
        where: { id: input.id },
        include: { analysis: true, case: { select: { userId: true } } },
      });

      if (!document) {
        throwNotFound('Documento');
      }

      await getOwnedCase(ctx.prisma, document.caseId, ctx.user.id);
      return document;
    }),

  upload: protectedProcedure
    .input(
      z.object({
        caseId: z.string().cuid(),
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        contentBase64: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.caseId, ctx.user.id);

      const rawBuffer = Buffer.from(input.contentBase64, 'base64');

      if (rawBuffer.length > MAX_UPLOAD_BYTES) {
        throwBadRequest('El archivo supera el límite de 20 MB');
      }

      const dek = await ensureUserDek(ctx.prisma, ctx.user.id);
      const { ciphertext, iv, authTag } = encryptBuffer(rawBuffer, dek);

      const stored = await uploadEncryptedDocument({
        userId: ctx.user.id,
        caseId: input.caseId,
        filename: input.filename,
        mimeType: input.mimeType,
        ciphertext,
        iv,
        authTag,
      });

      const document = await ctx.prisma.document.create({
        data: {
          caseId: input.caseId,
          filename: input.filename,
          mimeType: input.mimeType,
          r2Key: stored.r2Key,
          size: stored.size,
          encrypted: true,
          checksum: stored.checksum,
          metadata: stored.metadata as unknown as Prisma.InputJsonValue,
        },
      });

      await ctx.prisma.timelineEvent.create({
        data: {
          caseId: input.caseId,
          type: TimelineEventType.DOCUMENT_UPLOADED,
          description: `Documento cifrado subido: ${input.filename}`,
        },
      });

      await logAudit(ctx.prisma, {
        userId: ctx.user.id,
        action: AuditAction.CREATE,
        resource: 'document',
        resourceId: document.id,
        metadata: {
          filename: input.filename,
          encrypted: true,
          size: stored.size,
        },
        ipAddress: ctx.meta.ip,
        userAgent: ctx.meta.userAgent,
      });

      return document;
    }),

  register: protectedProcedure
    .input(
      z.object({
        caseId: z.string().cuid(),
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        r2Key: z.string().min(1).max(500),
        size: z.number().int().positive(),
        encrypted: z.boolean().default(true),
        checksum: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getOwnedCase(ctx.prisma, input.caseId, ctx.user.id);

      const document = await ctx.prisma.document.create({
        data: {
          caseId: input.caseId,
          filename: input.filename,
          mimeType: input.mimeType,
          r2Key: input.r2Key,
          size: input.size,
          encrypted: input.encrypted,
          ...(input.checksum !== undefined ? { checksum: input.checksum } : {}),
        },
      });

      await logAudit(ctx.prisma, {
        userId: ctx.user.id,
        action: AuditAction.CREATE,
        resource: 'document',
        resourceId: document.id,
        ipAddress: ctx.meta.ip,
        userAgent: ctx.meta.userAgent,
      });

      return document;
    }),

  getAnalysis: protectedProcedure
    .input(z.object({ documentId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.findUnique({
        where: { id: input.documentId },
        select: { caseId: true },
      });

      if (!document) {
        throwNotFound('Documento');
      }

      await getOwnedCase(ctx.prisma, document.caseId, ctx.user.id);

      const analysis = await ctx.prisma.documentAnalysis.findUnique({
        where: { documentId: input.documentId },
      });

      if (!analysis) {
        throwNotFound('Análisis del documento');
      }

      return analysis;
    }),
});