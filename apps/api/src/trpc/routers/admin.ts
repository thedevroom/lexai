import { z } from 'zod';
import { throwForbidden } from '../errors.js';
import { adminProcedure, createRouter } from '../trpc.js';

export const adminRouter = createRouter({
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const [users, activeCases, consultations, auditLogs24h] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.case.count({ where: { status: 'ACTIVE' } }),
      ctx.prisma.consultation.count(),
      ctx.prisma.auditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const planBreakdown = await ctx.prisma.user.groupBy({
      by: ['plan'],
      _count: { plan: true },
    });

    return {
      users,
      activeCases,
      consultations,
      auditLogs24h,
      planBreakdown: planBreakdown.map((p) => ({
        plan: p.plan,
        count: p._count.plan,
      })),
    };
  }),

  listUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = input.search
        ? {
            OR: [
              { email: { contains: input.search, mode: 'insensitive' as const } },
              { name: { contains: input.search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const users = await ctx.prisma.user.findMany({
        where,
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { cases: true } },
        },
      });

      let nextCursor: string | undefined;
      if (users.length > input.limit) {
        const next = users.pop();
        nextCursor = next?.id;
      }

      return { users, nextCursor };
    }),

  setUserActive: adminProcedure
    .input(z.object({ userId: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throwForbidden('No puede desactivar su propia cuenta');
      }

      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { isActive: input.isActive },
        select: { id: true, email: true, isActive: true },
      });
    }),

  listAuditLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.prisma.auditLog.findMany({
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
        },
      });

      let nextCursor: string | undefined;
      if (logs.length > input.limit) {
        const next = logs.pop();
        nextCursor = next?.id;
      }

      return { logs, nextCursor };
    }),
});