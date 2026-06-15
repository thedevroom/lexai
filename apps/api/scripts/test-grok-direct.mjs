/**
 * Prueba directa de Grok live (sin base de datos).
 * Verifica resolveXaiConfig + processConsultationMessage + LegalResponse.
 */
import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '../../../.env') });

const { resolveXaiConfig } = await import('@lexai/ai');
const { processConsultationMessage } = await import('../dist/services/ai/consultation-ai.js');
const { legalResponseSchema } = await import('@lexai/shared');

const xaiConfig = resolveXaiConfig();
console.log('\n=== xAI Config ===');
console.log(JSON.stringify({
  mode: xaiConfig.mode,
  heavyModel: xaiConfig.heavyModel,
  configured: xaiConfig.mode === 'live',
}));

if (xaiConfig.mode !== 'live') {
  console.error('FAIL: mode is not live');
  process.exit(1);
}

console.log('\n=== Calling processConsultationMessage (Grok live) ===');
const start = Date.now();

const result = await processConsultationMessage({
  query:
    'Me han despedido hoy sin preaviso después de 5 años en la empresa. ' +
    'No me han dado carta de despido ni indemnización. ¿Qué derechos tengo y qué plazos debo tener en cuenta?',
  legalArea: 'laboral',
  caseId: 'test-case-grok-live',
});

const elapsed = Date.now() - start;
const { metadata } = result;

console.log('\n=== Result ===');
console.log(JSON.stringify({
  aiMode: metadata.aiMode,
  executionMode: metadata.executionMode,
  modelUsed: metadata.modelUsed,
  processingMs: metadata.processingMs,
  elapsedMs: elapsed,
  fallbackReason: metadata.fallbackReason ?? null,
  agentName: metadata.agentName,
  areaId: metadata.areaId,
}));

const parsed = legalResponseSchema.safeParse(metadata.legalResponse);
console.log('\n=== LegalResponse validation ===');
console.log(JSON.stringify({
  valid: parsed.success,
  diagnosticoPreview: metadata.legalResponse.diagnostico?.slice(0, 120) + '...',
  hasDisclaimer: Boolean(metadata.legalResponse.disclaimer),
  accionesCount: metadata.legalResponse.accionesRecomendadas?.length ?? 0,
  plazosCount: metadata.legalResponse.plazos?.length ?? 0,
  confidenceScore: metadata.legalResponse.confidenceScore,
  riesgo: metadata.legalResponse.riesgo?.nivel,
}));

if (!parsed.success) {
  console.error('Validation issues:', parsed.error.issues.slice(0, 5));
  process.exit(1);
}

if (metadata.aiMode === 'live' && metadata.modelUsed !== 'mock' && metadata.modelUsed !== 'mock-fallback') {
  console.log('\n✅ SUCCESS: Grok live — aiMode live, model:', metadata.modelUsed);
  process.exit(0);
}

if (metadata.executionMode === 'fallback') {
  console.log('\n⚠️ FALLBACK:', metadata.fallbackReason);
  process.exit(2);
}

console.error('\n❌ FAIL: Expected live mode');
process.exit(1);