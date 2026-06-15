import path from 'node:path';
import type { NextConfig } from 'next';

const isVercel = Boolean(process.env['VERCEL']);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' as const }),
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  transpilePackages: ['@lexai/shared', '@lexai/design-tokens'],
  experimental: {
    optimizePackageImports: ['@lexai/shared', 'lucide-react', 'framer-motion'],
  },
  // tRPC proxied via app/api/trpc/[...path]/route.ts (safe JSON handling)
};

export default nextConfig;