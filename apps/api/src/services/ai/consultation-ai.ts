import { createOrchestrator, isXaiLiveConfigured, resolveXaiConfig } from '@lexai/ai';
import type { LegalResponse } from '@lexai/shared';
import type { LegalAreaId } from '@lexai/shared';
import { getDisclaimerForArea, getLegalAreaById } from '@lexai/shared';
import {
  buildAbuseRefusalResponse,
  detectAbuseIntent,
} from '../security/anti-abuse.js';

export interface ConsultationAiInput {
  query: string;
  legalArea: LegalAreaId;
  history?: { role: 'user' | 'assistant'; content: string }[];
  caseId: string;
}

export interface ConsultationAiResult {
  content: string;
  metadata: {
    legalResponse: LegalResponse;
    areaId: LegalAreaId;
    agentName: string;
    modelUsed: string;
    processingMs: number;
    aiMode: 'live' | 'mock' | 'blocked';
    executionMode?: 'live' | 'mock' | 'fallback';
    fallbackReason?: string;
  };
}

export interface AiIntegrationStatus {
  configured: boolean;
  mode: 'live' | 'mock';
  heavyModel: string;
  volumeModel: string;
  readyForActivation: boolean;
}

/**
 * Estado de integración xAI — útil para verificar sin llamar a Grok.
 * Activación: añadir XAI_API_KEY al .env → mode pasa a 'live' automáticamente.
 */
export function getAiIntegrationStatus(): AiIntegrationStatus {
  const config = resolveXaiConfig();
  return {
    configured: isXaiLiveConfigured(),
    mode: config.mode,
    heavyModel: config.heavyModel,
    volumeModel: config.volumeModel,
    readyForActivation: true,
  };
}

function mapExecutionToAiMode(
  executionMode: 'live' | 'mock' | 'fallback',
): 'live' | 'mock' {
  return executionMode === 'live' ? 'live' : 'mock';
}

export function formatLegalResponseAsMarkdown(
  response: LegalResponse,
  agentName: string,
  areaLabel: string,
): string {
  const plazos =
    response.plazos.length > 0
      ? response.plazos
          .map((p) => `- **${p.descripcion}** (${p.urgencia})${p.fechaLimite ? ` — ${p.fechaLimite}` : ''}`)
          .join('\n')
      : '_Sin plazos identificados_';

  const acciones =
    response.accionesRecomendadas.length > 0
      ? response.accionesRecomendadas
          .sort((a, b) => a.prioridad - b.prioridad)
          .map((a) => `${String(a.prioridad)}. ${a.accion}`)
          .join('\n')
      : '_Sin acciones inmediatas_';

  const legislacion =
    response.legislacionCitada.length > 0
      ? response.legislacionCitada
          .map((l) => `> **${l.norma}** — Art. ${l.articulo}: ${l.texto}`)
          .join('\n\n')
      : '';

  const disclaimer = response.disclaimer;

  return `## Diagnóstico

${response.diagnostico}

### Sus derechos
${response.derechos.map((d) => `- ${d}`).join('\n') || '_Pendiente de análisis_'}

### Plazos críticos
${plazos}

### Nivel de riesgo
**${response.riesgo.nivel.toUpperCase()}** — ${String(response.riesgo.score)}/10 (${response.riesgo.semaforo})

### Acciones recomendadas
${acciones}

${legislacion ? `### Legislación citada\n${legislacion}\n` : ''}

---
*${agentName} · ${areaLabel} · Confianza: ${String(Math.round(response.confidenceScore * 100))}%*

> ⚖️ **Aviso legal:** ${disclaimer}`;
}

function enforceDisclaimer(response: LegalResponse, areaId: LegalAreaId): LegalResponse {
  return {
    ...response,
    disclaimer: getDisclaimerForArea(areaId),
  };
}

/**
 * Punto de integración IA para consultas.
 *
 * Flujo mock ↔ live (automático vía XAI_API_KEY):
 *   processConsultationMessage()
 *     → createOrchestrator({ apiKey })     [solo si resolveXaiConfig().mode === 'live']
 *     → orchestrator.processConsultation()
 *       → callGrokCompletion()              [packages/ai/src/clients/xai-client.ts]
 *
 * Sin XAI_API_KEY válida → aiMode: 'mock'
 * Con XAI_API_KEY válida → aiMode: 'live' (o 'mock' si Grok falla — executionMode: 'fallback')
 */
export async function processConsultationMessage(
  input: ConsultationAiInput,
): Promise<ConsultationAiResult> {
  const abuseCheck = detectAbuseIntent(input.query);
  const area = getLegalAreaById(input.legalArea);
  const agentName = area?.agentName ?? 'Agente LexAI';
  const areaLabel = area?.label ?? input.legalArea;

  if (abuseCheck.blocked) {
    const refusal = enforceDisclaimer(
      buildAbuseRefusalResponse(input.legalArea),
      input.legalArea,
    );
    return {
      content: formatLegalResponseAsMarkdown(refusal, agentName, areaLabel),
      metadata: {
        legalResponse: refusal,
        areaId: input.legalArea,
        agentName,
        modelUsed: 'anti-abuse',
        processingMs: 0,
        aiMode: 'blocked',
      },
    };
  }

  const xaiConfig = resolveXaiConfig();

  if (process.env['NODE_ENV'] === 'development') {
    console.info(
      JSON.stringify({
        level: 'info',
        component: 'consultation-ai',
        event: 'ai_mode_resolved',
        mode: xaiConfig.mode,
        caseId: input.caseId,
        areaId: input.legalArea,
      }),
    );
  }

  const orchestrator = createOrchestrator({
    heavyModel: xaiConfig.heavyModel,
    volumeModel: xaiConfig.volumeModel,
    ...(xaiConfig.apiKey ? { apiKey: xaiConfig.apiKey } : {}),
  });

  const result = await orchestrator.processConsultation({
    query: input.query,
    caseId: input.caseId,
    legalArea: input.legalArea,
    ...(input.history ? { history: input.history } : {}),
  });

  const aiMode = mapExecutionToAiMode(result.executionMode);
  const enforcedResponse = enforceDisclaimer(result.response, result.areaId);
  const resolvedArea = getLegalAreaById(result.areaId);
  const resolvedAgent = resolvedArea?.agentName ?? agentName;
  const resolvedLabel = resolvedArea?.label ?? areaLabel;

  const content = formatLegalResponseAsMarkdown(
    enforcedResponse,
    resolvedAgent,
    resolvedLabel,
  );

  return {
    content,
    metadata: {
      legalResponse: enforcedResponse,
      areaId: result.areaId,
      agentName: resolvedAgent,
      modelUsed: result.modelUsed,
      processingMs: result.processingMs,
      aiMode,
      executionMode: result.executionMode,
      ...(result.fallbackReason ? { fallbackReason: result.fallbackReason } : {}),
    },
  };
}