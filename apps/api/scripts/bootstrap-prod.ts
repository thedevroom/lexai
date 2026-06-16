/**
 * Idempotent production bootstrap: migrations are run separately;
 * this ensures demo accounts exist for first login.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    email: 'admin@lexai.es',
    password: 'AdminLexAI2026!',
    name: 'Admin LexAI',
    role: UserRole.ADMIN,
  },
  {
    email: 'demo@lexai.es',
    password: 'DemoLexAI2026!',
    name: 'Demo User',
    role: UserRole.USER,
  },
] as const;

async function main() {
  for (const account of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });
    if (existing) continue;

    const passwordHash = await bcrypt.hash(account.password, 12);
    await prisma.user.create({
      data: {
        email: account.email,
        name: account.name,
        passwordHash,
        role: account.role,
      },
    });
    console.log(`[bootstrap] Created user ${account.email}`);
  }
}

main()
  .catch((error) => {
    console.error('[bootstrap] Failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());