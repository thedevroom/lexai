import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const DB_SCRIPT = path.join(root, 'apps', 'api', 'scripts', 'start-embedded-db.mjs');
const PORT = 5432;
const MAX_WAIT_MS = 60_000;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function spawnDetached(command, args) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    detached: false,
  });
  child.on('error', (err) => console.error('[dev-with-db]', err));
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

async function main() {
  console.log('[dev-with-db] Starting embedded PostgreSQL…');
  const dbChild = spawnDetached('node', [DB_SCRIPT]);

  try {
    await waitForPort(PORT);
    console.log('[dev-with-db] PostgreSQL is up — running migrations…');
    await run('pnpm', ['db:migrate:deploy']);

    console.log('[dev-with-db] Seeding database…');
    await run('pnpm', ['db:seed']);

    console.log('[dev-with-db] Starting turbo dev…');
    const devChild = spawnDetached('pnpm', ['dev']);

    const shutdown = () => {
      console.log('\n[dev-with-db] Stopping…');
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
    console.error('[dev-with-db] Failed:', err);
    dbChild.kill('SIGTERM');
    process.exit(1);
  }
}

main();