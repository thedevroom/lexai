import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env['WEB_URL'] ?? 'https://lexai-bay.vercel.app';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/admin/', '/onboarding'] },
    sitemap: `${base}/sitemap.xml`,
  };
}