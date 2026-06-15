import { createOrchestrator, resolveXaiConfig } from '@lexai/ai';
import type { LegalAreaId } from '@lexai/shared';

export interface TranscriptSegment {
  speaker: 'user' | 'agent' | 'system';
  text: string;
  startMs?: number;
  endMs?: number;
}

export interface TranscriptionPipelineInput {
  caseId: string;
  legalArea: LegalAreaId;
  segments: TranscriptSegment[];
}

export interface PostCallSummaryResult {
  summary: string;
  actions: { prioridad: number; accion: string }[];
  diagnostico: string;
  modelUsed: string;
  processingMs: number;
}

/**
 * Pipeline post-llamada: transcripción → LexAIOrchestrator → resumen estructurado.
 *
 * En fase SA-4 completa se conectará con STT en tiempo real (LiveKit).
 * Por ahora procesa segmentos acumulados al finalizar la sesión.
 */
export async function processTranscriptToSummary(
  input: TranscriptionPipelineInput,
): Promise<PostCallSummaryResult> {
  const start = Date.now();
  const transcriptText = input.segments
    .map((s) => `[${s.speaker}]: ${s.text}`)
    .join('\n');

  const query =
    `Resumen de consulta telefónica jurídica. Transcripción:\n\n${transcriptText}\n\n` +
    'Genere un resumen ejecutivo de la consulta, puntos clave y próximas acciones.';

  const xaiConfig = resolveXaiConfig();
  const orchestrator = createOrchestrator({
    heavyModel: xaiConfig.heavyModel,
    volumeModel: xaiConfig.volumeModel,
    ...(xaiConfig.apiKey ? { apiKey: xaiConfig.apiKey } : {}),
  });

  const result = await orchestrator.processConsultation({
    query,
    caseId: input.caseId,
    legalArea: input.legalArea,
  });

  const actions = result.response.accionesRecomendadas.map((a) => ({
    prioridad: a.prioridad,
    accion: a.accion,
  }));

  return {
    summary: result.response.diagnostico,
    actions,
    diagnostico: result.response.diagnostico,
    modelUsed: result.modelUsed,
    processingMs: Date.now() - start,
  };
}