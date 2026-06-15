import type { LegalAreaId } from '@lexai/shared';
import { getDisclaimerForArea } from '@lexai/shared';

export interface AbuseCheckResult {
  blocked: boolean;
  reason?: string;
  category?: 'illegal_activity' | 'self_harm' | 'fraud';
}

const ILLEGAL_ACTIVITY_PATTERNS: readonly RegExp[] = [
  /\b(cómo|como)\s+(robar|estafar|blanquear|falsificar|hackear|evadir\s+impuestos)\b/i,
  /\b(ayúdame|ayudame)\s+a\s+(cometer|planificar)\s+(un\s+)?(delito|fraude|estafa)\b/i,
  /\b(eludir|evadir)\s+(la\s+)?(hacienda|fisco|aeat)\s+(sin\s+que\s+me\s+cachen)\b/i,
  /\b(fabricar|conseguir)\s+(drogas|armas|documentos?\s+falsos?)\b/i,
  /\b(lavar|blanquear)\s+dinero\b/i,
];

const REFUSAL_MESSAGE =
  'No puedo proporcionar orientación sobre actividades ilegales o fraudulentas. ' +
  'Si necesita asesoramiento jurídico legítimo sobre defensa, denuncia o regularización, reformule su consulta.';

export function detectAbuseIntent(query: string): AbuseCheckResult {
  const normalized = query.trim();

  for (const pattern of ILLEGAL_ACTIVITY_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        blocked: true,
        reason: REFUSAL_MESSAGE,
        category: 'illegal_activity',
      };
    }
  }

  return { blocked: false };
}

export function buildAbuseRefusalResponse(areaId: LegalAreaId) {
  const disclaimer = getDisclaimerForArea(areaId);

  return {
    diagnostico: REFUSAL_MESSAGE,
    derechos: [] as string[],
    plazos: [] as { descripcion: string; urgencia: 'alta' | 'media' | 'baja' }[],
    riesgo: { nivel: 'alto' as const, score: 9, semaforo: 'rojo' as const },
    accionesRecomendadas: [
      {
        prioridad: 1,
        accion: 'Contacte con un abogado colegiado si necesita asesoramiento legítimo',
      },
    ],
    legislacionCitada: [] as {
      norma: string;
      articulo: string;
      texto: string;
    }[],
    jurisprudencia: [] as {
      tribunal: string;
      sentencia: string;
      fecha: string;
      resumen: string;
    }[],
    confidenceScore: 1,
    disclaimer,
    irac: {
      issue: 'Solicitud fuera del ámbito ético de LexAI',
      rule: 'Restricciones de uso y compliance legal',
      application: 'La consulta solicita orientación sobre actividad potencialmente ilícita',
      conclusion: 'Derivación sin proporcionar información útil para actividades ilegales',
    },
  };
}

export function getSensitiveAreaRateLimit(areaId: LegalAreaId): {
  limit: number;
  windowSeconds: number;
} {
  if (areaId === 'penal' || areaId === 'fiscal') {
    return { limit: 15, windowSeconds: 60 };
  }
  return { limit: 60, windowSeconds: 60 };
}