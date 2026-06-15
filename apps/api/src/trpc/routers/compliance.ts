import { AuditAction, ConsentType } from '@prisma/client';
import { z } from 'zod';
import { logAudit } from '../../lib/audit.js';
import { DATA_RETENTION_POLICY } from '../../services/compliance/data-retention.js';
import { deleteStoredDocument } from '../../services/storage/r2.js';
import { throwBadRequest } from '../errors.js';
import { createRouter, protectedProcedure, sensitiveProcedure } from '../trpc.js';

const consentInputSchema = z.object({
  termsOfService: z.boolean(),
  privacyPolicy: z.boolean(),
  aiProcessing: z.boolean(),
  analyticsCookies: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export const complianceRouter = createRouter({
  getRetentionPolicy: protectedProcedure.query(() => DATA_RETENTION_POLICY),

  recordConsents: protectedProcedure
    .input(consentInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.termsOfService || !input.privacyPolicy || !input.aiProcessing) {
        throwBadRequest(
          'Debe aceptar Términos de Servicio, Política de Privacidad y procesamiento IA',
        );
      }

      const consentEntries: {
        type: ConsentType;
        granted: boolean;
      }[] = [
        { type: ConsentType.TERMS_OF_SERVICE, granted: input.termsOfService },
        { type: ConsentType.PRIVACY_POLICY, granted: input.privacyPolicy },
        { type: ConsentType.AI_PROCESSING, granted: input.aiProcessing },
      ];

      if (input.analyticsCookies !== undefined) {
        consentEntries.push({
          type: ConsentType.ANALYTICS_COOKIES,
          granted: input.analyticsCookies,
        });
      }
      if (input.marketingEmails !== undefined) {
        consentEntries.push({
          type: ConsentType.MARKETING_EMAILS,
          granted: input.marketingEmails,
        });
      }

      const now = new Date();

      await ctx.prisma.$transaction(async (tx) => {
        for (const entry of consentEntries) {
          await tx.consentRecord.upsert({
            where: {
              userId_type: { userId: ctx.user.id, type: entry.type },
            },
            create: {
              userId: ctx.user.id,
              type: entry.type,
              granted: entry.granted,
              grantedAt: entry.granted ? now : null,
              ip: ctx.meta.ip,
              userAgent: ctx.meta.userAgent,
              version: DATA_RETENTION_POLICY.version,
            },
            update: {
              granted: entry.granted,
              grantedAt: entry.granted ? now : null,
              revokedAt: entry.granted ? null : now,
              ip: ctx.meta.ip,
              userAgent: ctx.meta.userAgent,
              version: DATA_RETENTION_POLICY.version,
            },
          });
        }
      });

      await logAudit(ctx.prisma, {
        userId: ctx.user.id,
        action: AuditAction.CONSENT_GRANTED,
        resource: 'consent',
        metadata: { types: consentEntries.map((e) => e.type) },
        ipAddress: ctx.meta.ip,
        userAgent: ctx.meta.userAgent,
      });

      return { success: true, recordedAt: now };
    }),

  getConsents: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.consentRecord.findMany({
      where: { userId: ctx.user.id },
      orderBy: { updatedAt: 'desc' },
    });
  }),

  exportUserData: sensitiveProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [user, cases, consents, auditLogs] = await Promise.all([
      ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          locale: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      ctx.prisma.case.findMany({
        where: { userId },
        include: {
          consultations: { include: { messages: true } },
          documents: { include: { analysis: true } },
          legalDocuments: { include: { versions: true } },
          deadlines: true,
          timelineEvents: true,
        },
      }),
      ctx.prisma.consentRecord.findMany({ where: { userId } }),
      ctx.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      format: 'LexAI-RGPD-Export-v1',
      retentionPolicy: DATA_RETENTION_POLICY.version,
      user,
      cases,
      consents,
      auditLogs,
    };

    await logAudit(ctx.prisma, {
      userId,
      action: AuditAction.EXPORT,
      resource: 'user_data',
      resourceId: userId,
      ipAddress: ctx.meta.ip,
      userAgent: ctx.meta.userAgent,
    });

    return exportPayload;
  }),

  deleteAccount: sensitiveProcedure
    .input(
      z.object({
        confirmation: z.literal('ELIMINAR MI CUENTA'),
      }),
    )
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id;

      const documents = await ctx.prisma.document.findMany({
        where: { case: { userId } },
        select: { r2Key: true },
      });

      for (const doc of documents) {
        await deleteStoredDocument(doc.r2Key).catch(() => undefined);
      }

      await logAudit(ctx.prisma, {
        userId,
        action: AuditAction.DELETE,
        resource: 'user_account',
        resourceId: userId,
        metadata: { reason: 'RGPD Art. 17 — derecho al olvido' },
        ipAddress: ctx.meta.ip,
        userAgent: ctx.meta.userAgent,
      });

      await ctx.prisma.user.delete({ where: { id: userId } });

      return { success: true, deletedAt: new Date().toISOString() };
    }),
});