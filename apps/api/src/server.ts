import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { createContext } from './trpc/context.js';
import { appRouter } from './trpc/router.js';

export async function createServer() {
  const isDev = process.env['NODE_ENV'] !== 'production';
  const logLevel = process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info');

  const server = Fastify({
    logger: isDev
      ? {
          level: logLevel,
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss' },
          },
        }
      : { level: logLevel },
  });

  await server.register(cors, {
    origin: process.env['WEB_URL'] ?? 'http://localhost:3000',
    credentials: true,
  });

  server.get('/health', () => {
    return {
      status: 'ok',
      service: 'lexai-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    } as const;
  });

  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  return server;
}