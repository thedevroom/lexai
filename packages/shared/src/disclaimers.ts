import type { LegalAreaId } from './legal-areas.js';
import { getLegalAreaById } from './legal-areas.js';

const BASE_DISCLAIMER =
  'The information provided by LexAI is general legal guidance only ' +
  'and does not constitute binding legal advice or an attorney-client relationship. ' +
  'For decisions with significant legal consequences, consult a licensed attorney.';

const STRICT_DISCLAIMERS: Partial<Record<LegalAreaId, string>> = {
  penal:
    BASE_DISCLAIMER +
    ' In criminal matters, LexAI does not replace the technical defense provided by an attorney. ' +
    'Do not rely solely on this tool for decisions affecting your liberty or fundamental rights.',
  fiscal:
    BASE_DISCLAIMER +
    ' In tax matters, LexAI does not provide binding tax advice and does not replace ' +
    'a licensed tax advisor. Tax obligations require professional review.',
};

export function getDisclaimerForArea(areaId: LegalAreaId): string {
  const area = getLegalAreaById(areaId);
  if (area?.strictDisclaimer && STRICT_DISCLAIMERS[areaId]) {
    return STRICT_DISCLAIMERS[areaId] ?? BASE_DISCLAIMER;
  }
  return BASE_DISCLAIMER;
}

export { BASE_DISCLAIMER };