#!/usr/bin/env node
/**
 * Import variables from root .env into Vercel (production).
 * Overrides WEB_URL and NEXTAUTH_URL for the live deployment.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const environment = process.argv[2] ?? 'production';
const productionUrl = process.argv[3] ?? 'https://lexai-bay.vercel.app';

const SKIP = new Set(['NODE_ENV', 'DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL']);
const OVERRIDES = {
  WEB_URL: productionUrl,
  NEXTAUTH_URL: productionUrl,
};

function parseEnv(content) {
  const vars = new Map();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (SKIP.has(key)) continue;
    if (OVERRIDES[key]) value = OVERRIDES[key];
    vars.set(key, value);
  }
  return vars;
}

function addEnv(name, value) {
  const vercelCmd = process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
  return spawnSync(
    vercelCmd,
    ['env', 'add', name, environment, '--force', '--yes'],
    { cwd: root, input: value, encoding: 'utf8', shell: process.platform === 'win32' },
  );
}

const content = readFileSync(envPath, 'utf8');
const vars = parseEnv(content);

console.log(`Importing ${vars.size} variables to Vercel (${environment})...\n`);

let ok = 0;
let fail = 0;

for (const [name, value] of vars) {
  const result = addEnv(name, value);
  if (result.status === 0) {
    console.log(`✓ ${name}`);
    ok++;
  } else {
    const msg = (result.stderr || result.stdout || result.error?.message || 'unknown error')
      .trim()
      .split('\n')
      .filter(Boolean)[0];
    console.error(`✗ ${name}: ${msg}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} imported, ${fail} failed.`);
if (fail > 0) process.exit(1);