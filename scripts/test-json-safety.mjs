/**
 * Validates tRPC proxy returns JSON (not plain-text deploy errors).
 * Run with web dev server: pnpm --filter @lexai/web dev
 */
const WEB = process.env.WEB_URL ?? 'http://localhost:3000';

async function testNonJsonUpstream() {
  const res = await fetch(`${WEB}/api/trpc/auth.login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: { email: 'x@test.com', password: 'wrongpass' } }),
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
    console.log('✓ Response is valid JSON');
    console.log('  status:', res.status);
    if (parsed[0]?.error?.json?.message) {
      console.log('  message:', parsed[0].error.json.message.slice(0, 80));
    }
    return true;
  } catch (e) {
    console.error('✗ Invalid JSON:', text.slice(0, 200));
    return false;
  }
}

async function testHealth() {
  const res = await fetch(`${WEB}/api/health`);
  const json = await res.json();
  console.log('✓ /api/health:', json.status, json.api?.status ?? 'n/a');
  return res.ok;
}

const ok = (await testHealth()) && (await testNonJsonUpstream());
process.exit(ok ? 0 : 1);