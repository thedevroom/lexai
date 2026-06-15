/**
 * Runtime smoke tests — requires DB, API and Web to be running.
 */
import net from 'node:net';

/** Plain-object tRPC + superjson wire format (no extra dependency). */
function serializeTrpc(input) {
  return JSON.stringify({ json: input });
}

function deserializeTrpc(data) {
  if (data?.json !== undefined) return data.json;
  return data;
}

const API = process.env.API_URL ?? 'http://localhost:4000';
const WEB = process.env.WEB_URL ?? 'http://localhost:3000';
const DB_PORT = 5432;

const checks = [];

function ok(name) {
  checks.push({ name, pass: true });
  console.log(`  ✓ ${name}`);
}

function fail(name, detail) {
  checks.push({ name, pass: false, detail });
  console.error(`  ✗ ${name}: ${detail}`);
}

function waitForPort(port, host = '127.0.0.1', timeoutMs = 30_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ port, host }, () => {
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`port ${port} not open`));
          return;
        }
        setTimeout(attempt, 400);
      });
    };
    attempt();
  });
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`non-JSON from ${url}: ${text.slice(0, 200)}`);
  }
  return { res, json };
}

async function main() {
  console.log('\n[preflight] Runtime smoke tests\n');

  try {
    await waitForPort(DB_PORT);
    ok(`PostgreSQL port ${DB_PORT}`);
  } catch (e) {
    fail(`PostgreSQL port ${DB_PORT}`, e.message);
  }

  try {
    const { res, json } = await fetchJson(`${API}/health`);
    if (res.ok && json.status === 'ok') ok('API /health');
    else fail('API /health', JSON.stringify(json));
  } catch (e) {
    fail('API /health', e.message);
  }

  const webPages = [
    '/',
    '/login',
    '/dashboard',
    '/onboarding',
    '/producto',
    '/legal/privacy',
    '/legal/cookies',
    '/legal/terms',
  ];
  for (const path of webPages) {
    try {
      const res = await fetch(`${WEB}${path}`);
      if (res.ok) ok(`Web GET ${path}`);
      else fail(`Web GET ${path}`, `HTTP ${res.status}`);
    } catch (e) {
      fail(`Web GET ${path}`, e.message);
    }
  }

  const email = `smoke-${Date.now()}@lexai.local`;
  try {
    const { res, json } = await fetchJson(`${API}/trpc/auth.register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializeTrpc({
        email,
        password: 'SmokeTest123!',
        name: 'Smoke Test',
      }),
    });
    const data = deserializeTrpc(json.result?.data ?? json);
    if (res.ok && data?.user?.id && data?.token) {
      ok('API auth.register');
    } else {
      fail('API auth.register', JSON.stringify(json).slice(0, 300));
    }
  } catch (e) {
    fail('API auth.register', e.message);
  }

  try {
    const { res, json } = await fetchJson(`${WEB}/api/trpc/auth.register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializeTrpc({
        email: `proxy-${Date.now()}@lexai.local`,
        password: 'SmokeTest123!',
        name: 'Proxy Smoke',
      }),
    });
    const data = deserializeTrpc(json.result?.data ?? json);
    if (res.ok && data?.user?.id && data?.token) {
      ok('Web proxy /api/trpc/auth.register');
    } else {
      fail('Web proxy /api/trpc/auth.register', JSON.stringify(json).slice(0, 300));
    }
  } catch (e) {
    fail('Web proxy /api/trpc/auth.register', e.message);
  }

  const failed = checks.filter((c) => !c.pass);
  console.log(`\n[preflight] ${checks.length - failed.length}/${checks.length} passed\n`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[preflight] Fatal:', err);
  process.exit(1);
});