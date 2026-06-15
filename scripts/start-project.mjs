/**
 * Full project startup with preflight checks:
 * 1. Static checks (lint, typecheck, test, build)
 * 2. Embedded PostgreSQL + migrate + seed
 * 3. turbo dev
 * 4. Runtime smoke tests
 */
import { execSync, spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const DB_SCRIPT = path.join(root, 'apps', 'api', 'scripts', 'start-embedded-db.mjs');
const SMOKE_SCRIPT = path.join(root, 'scripts', 'smoke-runtime.mjs');
const MAX_WAIT_MS = 90_000;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function spawnBg(command, args) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  child.on('error', (err) => console.error('[start-project]', err));
  return child;
}

function waitForPort(port, host = '127.0.0.1') {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ port, host }, () => {
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - started > MAX_WAIT_MS) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(attempt, 500);
      });
    };
    attempt();
  });
}

function freePorts(ports) {
  if (process.platform !== 'win32') return;
  for (const port of ports) {
    try {
      const out = execSync(
        `netstat -ano | findstr ":${port} "`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] },
      );
      const pids = new Set(
        out
          .split('\n')
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && /^\d+$/.test(pid)),
      );
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' });
        } catch {
          // already gone
        }
      }
    } catch {
      // port free
    }
  }
}

async function main() {
  console.log('\n═══ LexAI — Liberando puertos 3000/4000/5432 ═══\n');
  freePorts([3000, 4000, 5432]);

  console.log('\n═══ LexAI — Preflight estático ═══\n');
  await run('pnpm', ['preflight']);

  console.log('\n═══ LexAI — Infraestructura ═══\n');
  const dbChild = spawnBg('node', [DB_SCRIPT]);

  try {
    await waitForPort(5432);
    console.log('[start-project] PostgreSQL OK');

    await run('pnpm', ['db:migrate:deploy']);
    await run('pnpm', ['db:seed']);

    console.log('\n═══ LexAI — Arrancando dev ═══\n');
    const devChild = spawnBg('pnpm', ['dev']);

    await waitForPort(4000);
    await waitForPort(3000);
    console.log('[start-project] API y Web escuchando');

    console.log('\n═══ LexAI — Smoke tests runtime ═══\n');
    await run('node', [SMOKE_SCRIPT]);

    console.log('\n══════════════════════════════════════════');
    console.log('  ✅ Todo OK — proyecto listo');
    console.log('  Web:  http://localhost:3000');
    console.log('  API:  http://localhost:4000');
    console.log('  Ctrl+C para detener');
    console.log('══════════════════════════════════════════\n');

    const shutdown = () => {
      console.log('\n[start-project] Deteniendo…');
      dbChild.kill('SIGTERM');
      devChild.kill('SIGTERM');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    devChild.on('exit', (code) => {
      dbChild.kill('SIGTERM');
      process.exit(code ?? 0);
    });
  } catch (err) {
    console.error('\n[start-project] FALLO:', err.message);
    dbChild.kill('SIGTERM');
    process.exit(1);
  }
}

main();