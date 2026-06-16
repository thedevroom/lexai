import path from 'node:path';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import type { NextConfig } from 'next';

const isVercel = Boolean(process.env['VERCEL']);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' as const }),
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
  transpilePackages: ['@lexai/shared', '@lexai/design-tokens'],
  serverExternalPackages: ['@lexai/ai', '@prisma/client', 'bcryptjs', 'ioredis'],
  experimental: {
    optimizePackageImports: ['@lexai/shared', 'lucide-react', 'framer-motion'],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;