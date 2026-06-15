import { describe, expect, it } from 'vitest';
import {
  decryptBuffer,
  encryptBuffer,
  unwrapDek,
  wrapDek,
} from './envelope.js';

describe('envelope encryption', () => {
  it('wraps and unwraps DEKs consistently', () => {
    const dek = Buffer.alloc(32, 7);
    const wrapped = wrapDek(dek);
    const unwrapped = unwrapDek(wrapped);
    expect(unwrapped.equals(dek)).toBe(true);
  });

  it('encrypts and decrypts buffers with AES-256-GCM', () => {
    const dek = Buffer.alloc(32, 3);
    const plaintext = Buffer.from('Documento jurídico confidencial — LexAI');

    const { ciphertext, iv, authTag } = encryptBuffer(plaintext, dek);
    const decrypted = decryptBuffer(ciphertext, dek, iv, authTag);

    expect(decrypted.toString('utf-8')).toBe(plaintext.toString('utf-8'));
  });

  it('fails decryption with tampered ciphertext', () => {
    const dek = Buffer.alloc(32, 1);
    const { ciphertext, iv, authTag } = encryptBuffer(Buffer.from('test'), dek);
    const tampered = Buffer.concat([ciphertext, Buffer.from([0xff])]);

    expect(() => decryptBuffer(tampered, dek, iv, authTag)).toThrow();
  });
});