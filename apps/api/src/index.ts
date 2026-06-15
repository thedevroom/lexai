import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from './server.js';

loadEnv({ path: resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../.env') });

const PORT = Number(process.env['PORT'] ?? 4000);
const HOST = process.env['HOST'] ?? '0.0.0.0';

async function main(): Promise<void> {
  const server = await createServer();

  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`LexAI API listening on http://${HOST}:${String(PORT)}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

void main();