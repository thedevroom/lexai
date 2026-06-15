import type { AuditAction, Prisma, PrismaClient } from '@prisma/client';

export interface AuditParams {
  userId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(prisma: PrismaClient, params: AuditParams): Promise<void> {
  const data: Prisma.AuditLogCreateInput = {
    action: params.action,
    resource: params.resource,
  };

  if (params.userId) {
    data.user = { connect: { id: params.userId } };
  }
  if (params.resourceId) {
    data.resourceId = params.resourceId;
  }
  if (params.metadata) {
    data.metadata = params.metadata as Prisma.InputJsonValue;
  }
  if (params.ipAddress) {
    data.ipAddress = params.ipAddress;
  }
  if (params.userAgent) {
    data.userAgent = params.userAgent;
  }

  await prisma.auditLog.create({ data });
}