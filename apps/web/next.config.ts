import path from 'node:path';
import type { NextConfig } from 'next';

const apiUrl = process.env['API_URL'] ?? 'http://localhost:4000';

const isVercel = Boolean(process.env['VERCEL']);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' as const }),
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  transpilePackages: ['@lexai/shared', '@lexai/design-tokens'],
  experimental: {
    optimizePackageImports: ['@lexai/shared', 'lucide-react', 'framer-motion'],
  },
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: `${apiUrl}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;