import { AuditAction } from '@prisma/client';
import { z } from 'zod';
import { createAuthToken, hashPassword, verifyPassword } from '../../lib/auth.js';
import { throwBadRequest, throwConflict, throwUnauthorized } from '../errors.js';
import { createRouter, protectedProcedure, publicRateLimitedProcedure } from '../trpc.js';

export const authRouter = createRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        role: true,
        locale: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throwUnauthorized();
    }

    return user;
  }),

  register: publicRateLimitedProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(8, 'Minimum 8 characters'),
        name: z.string().min(2).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throwConflict('Email is already registered');
      }

      const passwordHash = await hashPassword(input.password);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          ...(input.name !== undefined ? { name: input.name } : {}),
        },
        select: { id: true, email: true, name: true, plan: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.CREATE,
          resource: 'user',
          resourceId: user.id,
          ipAddress: ctx.meta.ip,
          userAgent: ctx.meta.userAgent,
        },
      });

      const token = await createAuthToken(user);
      return { user, token };
    }),

  login: publicRateLimitedProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });

      if (!user?.passwordHash) {
        throwUnauthorized('Credenciales inválidas');
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throwUnauthorized('Credenciales inválidas');
      }

      if (!user.isActive) {
        throwBadRequest('Cuenta desactivada');
      }

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.LOGIN,
          resource: 'session',
          ipAddress: ctx.meta.ip,
          userAgent: ctx.meta.userAgent,
        },
      });

      const token = await createAuthToken(user);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
        token,
      };
    }),
});