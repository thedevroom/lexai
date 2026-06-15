import fs from 'node:fs/promises';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import { EMBEDDED_DB } from './embedded-db-config.mjs';

const pgVersionFile = path.join(EMBEDDED_DB.databaseDir, 'PG_VERSION');

async function isInitialised() {
  try {
    await fs.access(pgVersionFile);
    return true;
  } catch {
    return false;
  }
}

async function ensureDatabase(pg) {
  try {
    await pg.createDatabase(EMBEDDED_DB.database);
    console.log(`[embedded-db] Created database "${EMBEDDED_DB.database}"`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('already exists')) {
      console.log(`[embedded-db] Database "${EMBEDDED_DB.database}" already exists`);
      return;
    }
    throw err;
  }
}

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: EMBEDDED_DB.databaseDir,
    user: EMBEDDED_DB.user,
    password: EMBEDDED_DB.password,
    port: EMBEDDED_DB.port,
    persistent: true,
    onLog: (msg) => {
      const line = String(msg).trim();
      if (line) console.log(`[embedded-db] ${line}`);
    },
    onError: (err) => console.error('[embedded-db]', err),
  });

  if (!(await isInitialised())) {
    console.log('[embedded-db] Initialising cluster…');
    await pg.initialise();
  }

  console.log(`[embedded-db] Starting PostgreSQL on port ${EMBEDDED_DB.port}…`);
  await pg.start();
  await ensureDatabase(pg);

  console.log(`[embedded-db] Ready — ${EMBEDDED_DB.connectionString}`);
  console.log('[embedded-db] Press Ctrl+C to stop');

  const shutdown = async () => {
    console.log('\n[embedded-db] Shutting down…');
    await pg.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await new Promise(() => {});
}

main().catch((err) => {
  console.error('[embedded-db] Fatal:', err);
  process.exit(1);
});