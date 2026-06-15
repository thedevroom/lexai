/**
 * Prueba E2E de activación Grok live.
 * Uso: node --env-file=../../.env scripts/test-grok-live.mjs
 * (o desde apps/api con dotenv ya cargado vía index.ts)
 */
import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '../../../.env') });

const { resolveXaiConfig } = await import('@lexai/ai');
const { createServer } = await import('../dist/server.js');
const { legalResponseSchema } = await import('@lexai/shared');

const config = resolveXaiConfig();
console.log('\n=== xAI Config ===');
console.log(JSON.stringify({ mode: config.mode, heavyModel: config.heavyModel, hasKey: Boolean(config.apiKey) }));

if (config.mode !== 'live') {
  console.error('FAIL: Expected mode live, got', config.mode);
  process.exit(1);
}

const server = await createServer();
const testEmail = `grok-test-${Date.now()}@test.lexai.es`;
const testPassword = 'TestGrok2026!';

async function trpcMutation(path, input, token) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers['authorization'] = `Bearer ${token}`;

  const response = await server.inject({
    method: 'POST',
    url: `/trpc/${path}`,
    headers,
    payload: { json: input },
  });

  const body = JSON.parse(response.body);
  if (response.statusCode !== 200) {
    throw new Error(`${path} failed (${response.statusCode}): ${response.body}`);
  }
  return body.result?.data?.json ?? body;
}

try {
  const register = await trpcMutation('auth.register', {
    email: testEmail,
    password: testPassword,
    name: 'Grok Test User',
  });
  const token = register.result?.data?.json?.token ?? register.token;
  if (!token) throw new Error('No token from register');

  const caseResult = await trpcMutation(
    'cases.create',
    {
      title: 'Consulta despido improcedente — prueba Grok',
      description: 'Trabajador con 5 años de antigüedad despedido sin preaviso ni indemnización.',
      legalArea: 'LABORAL',
    },
    token,
  );
  const caseId = caseResult.result?.data?.json?.id ?? caseResult.id;

  const consultation = await trpcMutation(
    'consultations.create',
    { caseId, topic: 'Despido improcedente' },
    token,
  );
  const consultationId = consultation.result?.data?.json?.id ?? consultation.id;

  console.log('\n=== Sending message to Grok ===');
  const start = Date.now();

  const messageResult = await trpcMutation(
    'consultations.sendMessage',
    {
      consultationId,
      content:
        'Me han despedido hoy sin preaviso después de 5 años en la empresa. ' +
        'No me han dado carta de despido ni indemnización. ¿Qué derechos tengo y qué plazos debo tener en cuenta?',
    },
    token,
  );

  const payload = messageResult.result?.data?.json ?? messageResult;
  const aiMode = payload.aiMode;
  const assistant = payload.assistantMessage;
  const metadata = assistant?.metadata ?? {};

  console.log('\n=== Result ===');
  console.log(JSON.stringify({
    aiMode,
    executionMode: metadata.executionMode,
    modelUsed: metadata.modelUsed,
    areaId: metadata.areaId,
    processingMs: metadata.processingMs,
    elapsedMs: Date.now() - start,
    fallbackReason: metadata.fallbackReason ?? null,
  }));

  const legalResponse = metadata.legalResponse;
  if (legalResponse) {
    const parsed = legalResponseSchema.safeParse(legalResponse);
    console.log('\n=== LegalResponse validation ===');
    console.log(JSON.stringify({
      valid: parsed.success,
      hasDiagnostico: Boolean(legalResponse.diagnostico),
      hasDisclaimer: Boolean(legalResponse.disclaimer),
      accionesCount: legalResponse.accionesRecomendadas?.length ?? 0,
      plazosCount: legalResponse.plazos?.length ?? 0,
      confidenceScore: legalResponse.confidenceScore,
    }));

    if (!parsed.success) {
      console.error('Validation errors:', parsed.error.issues.slice(0, 3));
      process.exit(1);
    }
  }

  if (aiMode === 'live' && metadata.modelUsed !== 'mock' && metadata.modelUsed !== 'mock-fallback') {
    console.log('\n✅ SUCCESS: Grok live integration verified');
    process.exit(0);
  }

  if (metadata.executionMode === 'fallback') {
    console.log('\n⚠️ FALLBACK: Grok was attempted but failed — check logs');
    console.log('Reason:', metadata.fallbackReason);
    process.exit(2);
  }

  console.error('\n❌ FAIL: Still in mock mode');
  process.exit(1);
} catch (error) {
  console.error('\n❌ Test error:', error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await server.close();
}