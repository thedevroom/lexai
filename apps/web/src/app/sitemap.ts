import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env['WEB_URL'] ?? 'https://lexai-bay.vercel.app';
  const routes = [
    '',
    '/producto',
    '/empresa',
    '/contacto',
    '/seguridad',
    '/login',
    '/legal/terms',
    '/legal/privacy',
    '/legal/cookies',
    '/legal/aviso-legal',
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}