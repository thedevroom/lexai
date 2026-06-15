import type { PrismaClient } from '@prisma/client';
import { throwForbidden, throwNotFound } from '../trpc/errors.js';

export async function getOwnedCase(
  prisma: PrismaClient,
  caseId: string,
  userId: string,
): Promise<{ id: string; userId: string }> {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, userId: true },
  });

  if (!caseRecord) {
    throwNotFound('Expediente');
  }

  if (caseRecord.userId !== userId) {
    throwForbidden('No tiene acceso a este expediente');
  }

  return caseRecord;
}