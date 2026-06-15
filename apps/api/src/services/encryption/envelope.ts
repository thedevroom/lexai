import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const DEK_LENGTH = 32;

function getMasterKey(): Buffer {
  const raw = process.env['ENCRYPTION_MASTER_KEY'];
  if (!raw || raw.length < 32) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('ENCRYPTION_MASTER_KEY must be set in production (min 32 chars)');
    }
    return scryptSync('lexai-dev-master-key-change-in-production', 'lexai-salt', DEK_LENGTH);
  }
  return Buffer.from(raw, 'base64').length >= DEK_LENGTH
    ? Buffer.from(raw, 'base64').subarray(0, DEK_LENGTH)
    : scryptSync(raw, 'lexai-kek', DEK_LENGTH);
}

export interface EncryptedPayload {
  ciphertext: Buffer;
  iv: string;
  authTag: string;
}

export function wrapDek(dek: Buffer): string {
  const kek = getMasterKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, kek, iv);
  const encrypted = Buffer.concat([cipher.update(dek), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function unwrapDek(wrapped: string): Buffer {
  const kek = getMasterKey();
  const data = Buffer.from(wrapped, 'base64');
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, kek, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function encryptBuffer(data: Buffer, dek: Buffer): EncryptedPayload {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, dek, iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag().toString('base64');
  return { ciphertext, iv: iv.toString('base64'), authTag };
}

export function decryptBuffer(
  ciphertext: Buffer,
  dek: Buffer,
  iv: string,
  authTag: string,
): Buffer {
  const decipher = createDecipheriv(ALGORITHM, dek, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export async function ensureUserDek(
  prisma: PrismaClient,
  userId: string,
): Promise<Buffer> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { encryptionKeyId: true },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.encryptionKeyId) {
    return unwrapDek(user.encryptionKeyId);
  }

  const dek = randomBytes(DEK_LENGTH);
  const wrapped = wrapDek(dek);

  await prisma.user.update({
    where: { id: userId },
    data: { encryptionKeyId: wrapped },
  });

  return dek;
}