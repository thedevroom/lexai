#!/usr/bin/env node
/** Push production secrets to Vercel (idempotent with --force). */
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const environment = 'production';

function addEnv(name, value) {
  const vercelCmd = process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
  return spawnSync(
    vercelCmd,
    ['env', 'add', name, environment, '--force', '--yes'],
    { cwd: root, input: value, encoding: 'utf8', shell: process.platform === 'win32' },
  );
}

const secrets = {
  ENCRYPTION_MASTER_KEY: randomBytes(32).toString('base64'),
  NEXTAUTH_SECRET: randomBytes(32).toString('base64'),
  WEB_URL: 'https://lexai-bay.vercel.app',
  NEXTAUTH_URL: 'https://lexai-bay.vercel.app',
};

console.log('Setting production secrets on Vercel...\n');

for (const [name, value] of Object.entries(secrets)) {
  const result = addEnv(name, value);
  if (result.status === 0) {
    console.log(`✓ ${name}`);
  } else {
    console.error(`✗ ${name}:`, (result.stderr || result.stdout || '').trim());
    process.exit(1);
  }
}

console.log('\nDone.');