import type { LegalArea } from '@prisma/client';
import type { LegalAreaId } from '@lexai/shared';

const PRISMA_TO_SHARED: Record<LegalArea, LegalAreaId> = {
  LABORAL: 'laboral',
  CIVIL: 'civil',
  PENAL: 'penal',
  FAMILIA: 'familia',
  FISCAL: 'fiscal',
  TRAFICO: 'trafico',
  CONSUMIDOR: 'consumidor',
  MERCANTIL: 'mercantil',
  EXTRANJERIA: 'extranjeria',
};

export function prismaLegalAreaToShared(area: LegalArea): LegalAreaId {
  return PRISMA_TO_SHARED[area];
}