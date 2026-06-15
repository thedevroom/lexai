import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface UploadResult {
  r2Key: string;
  checksum: string;
  size: number;
}

export interface StoredObjectMeta {
  iv: string;
  authTag: string;
  encrypted: boolean;
  originalMimeType: string;
  originalFilename: string;
}

const LOCAL_STORAGE_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../.local-storage',
);

function isR2Configured(): boolean {
  return Boolean(
    process.env['R2_ACCESS_KEY_ID'] &&
      process.env['R2_SECRET_ACCESS_KEY'] &&
      process.env['R2_BUCKET_NAME'],
  );
}

function buildKey(userId: string, caseId: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ts = Date.now();
  return `users/${userId}/cases/${caseId}/${String(ts)}-${safeName}`;
}

export async function uploadEncryptedDocument(params: {
  userId: string;
  caseId: string;
  filename: string;
  mimeType: string;
  ciphertext: Buffer;
  iv: string;
  authTag: string;
}): Promise<UploadResult & { metadata: StoredObjectMeta }> {
  const r2Key = buildKey(params.userId, params.caseId, params.filename);
  const checksum = createHash('sha256').update(params.ciphertext).digest('hex');

  const metadata: StoredObjectMeta = {
    iv: params.iv,
    authTag: params.authTag,
    encrypted: true,
    originalMimeType: params.mimeType,
    originalFilename: params.filename,
  };

  if (isR2Configured()) {
    await uploadToR2(r2Key, params.ciphertext, metadata);
  } else {
    await uploadToLocal(r2Key, params.ciphertext, metadata);
  }

  return {
    r2Key,
    checksum,
    size: params.ciphertext.length,
    metadata,
  };
}

export async function downloadEncryptedDocument(r2Key: string): Promise<{
  ciphertext: Buffer;
  metadata: StoredObjectMeta;
}> {
  if (isR2Configured()) {
    return downloadFromR2(r2Key);
  }
  return downloadFromLocal(r2Key);
}

export async function deleteStoredDocument(r2Key: string): Promise<void> {
  if (isR2Configured()) {
    await deleteFromR2(r2Key);
  } else {
    await deleteFromLocal(r2Key);
  }
}

async function uploadToLocal(
  key: string,
  data: Buffer,
  metadata: StoredObjectMeta,
): Promise<void> {
  const filePath = join(LOCAL_STORAGE_DIR, key);
  const metaPath = `${filePath}.meta.json`;
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
  await writeFile(metaPath, JSON.stringify(metadata));
}

async function downloadFromLocal(key: string): Promise<{
  ciphertext: Buffer;
  metadata: StoredObjectMeta;
}> {
  const filePath = join(LOCAL_STORAGE_DIR, key);
  const metaPath = `${filePath}.meta.json`;
  const [ciphertext, metaRaw] = await Promise.all([
    readFile(filePath),
    readFile(metaPath, 'utf-8'),
  ]);
  return { ciphertext, metadata: JSON.parse(metaRaw) as StoredObjectMeta };
}

async function deleteFromLocal(key: string): Promise<void> {
  const filePath = join(LOCAL_STORAGE_DIR, key);
  const metaPath = `${filePath}.meta.json`;
  const { unlink } = await import('node:fs/promises');
  await Promise.all([
    unlink(filePath).catch(() => undefined),
    unlink(metaPath).catch(() => undefined),
  ]);
}

async function createR2Client() {
  const { S3Client } = await import('@aws-sdk/client-s3');
  const endpoint = process.env['R2_ENDPOINT'];
  if (!endpoint) {
    throw new Error('R2_ENDPOINT must be set when R2 credentials are configured');
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env['R2_ACCESS_KEY_ID'] ?? '',
      secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'] ?? '',
    },
  });
}

async function uploadToR2(
  key: string,
  data: Buffer,
  metadata: StoredObjectMeta,
): Promise<void> {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const client = await createR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: process.env['R2_BUCKET_NAME'],
      Key: key,
      Body: data,
      Metadata: {
        iv: metadata.iv,
        authtag: metadata.authTag,
        mime: metadata.originalMimeType,
        filename: metadata.originalFilename,
      },
      ServerSideEncryption: 'AES256',
    }),
  );
}

async function downloadFromR2(key: string): Promise<{
  ciphertext: Buffer;
  metadata: StoredObjectMeta;
}> {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const client = await createR2Client();

  const response = await client.send(
    new GetObjectCommand({
      Bucket: process.env['R2_BUCKET_NAME'],
      Key: key,
    }),
  );

  const body = response.Body;
  if (!body) {
    throw new Error('Objeto no encontrado en R2');
  }

  const ciphertext = Buffer.from(await body.transformToByteArray());
  const meta = response.Metadata ?? {};

  return {
    ciphertext,
    metadata: {
      iv: meta['iv'] ?? '',
      authTag: meta['authtag'] ?? '',
      encrypted: true,
      originalMimeType: meta['mime'] ?? 'application/octet-stream',
      originalFilename: meta['filename'] ?? key,
    },
  };
}

async function deleteFromR2(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  const client = await createR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env['R2_BUCKET_NAME'],
      Key: key,
    }),
  );
}