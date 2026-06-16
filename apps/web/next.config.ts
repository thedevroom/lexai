import path from 'node:path';
import type { NextConfig } from 'next';

const isVercel = Boolean(process.env['VERCEL']);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' as const }),
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  transpilePackages: ['@lexai/shared', '@lexai/design-tokens'],
  serverExternalPackages: ['@lexai/api', '@lexai/ai', '@prisma/client', 'bcryptjs', 'ioredis'],
  webpack(config) {
    const apiDist = path.join(import.meta.dirname, '../api/dist');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lexai/api/trpc/context': path.join(apiDist, 'trpc/context.js'),
      '@lexai/api/trpc': path.join(apiDist, 'trpc/router.js'),
    };
    return config;
  },
  experimental: {
    optimizePackageImports: ['@lexai/shared', 'lucide-react', 'framer-motion'],
  },
  // tRPC proxied via app/api/trpc/[...path]/route.ts (safe JSON handling)
};

export default nextConfig;