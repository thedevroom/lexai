import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_ISSUER = 'lexai';
const JWT_AUDIENCE = 'lexai-api';
const TOKEN_TTL = '7d';

function getJwtSecret(): Uint8Array {
  const secret = process.env['JWT_SECRET'] ?? process.env['NEXTAUTH_SECRET'];
  if (!secret || secret.length < 32) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be set (min 32 chars)');
    }
    return new TextEncoder().encode('lexai-dev-secret-change-in-production-32chars');
  }
  return new TextEncoder().encode(secret);
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAuthToken(user: Pick<User, 'id' | 'email'>): Promise<string> {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      return null;
    }

    const email = payload['email'];
    if (typeof email !== 'string') {
      return null;
    }

    return { sub: payload.sub, email };
  } catch {
    return null;
  }
}

export function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  return authorization.slice(7).trim() || null;
}