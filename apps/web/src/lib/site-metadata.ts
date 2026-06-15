import type { Metadata } from 'next';

const siteUrl = process.env['WEB_URL'] ?? 'https://lexai-bay.vercel.app';

export const siteConfig = {
  name: 'LexAI',
  title: 'LexAI — Despacho Jurídico de Inteligencia Artificial',
  description:
    'Despacho digital premium con 9 abogados IA especializados. Análisis jurídico, redacción de escritos y asesoramiento 24/7 en legislación española.',
  url: siteUrl,
  ogImage: `${siteUrl}/og-image.png`,
  twitterHandle: '@thedevroom',
  keywords: [
    'legaltech',
    'inteligencia artificial jurídica',
    'abogado IA',
    'derecho español',
    'asesoramiento legal',
    'RGPD',
    'despacho digital',
  ],
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'LexAI', url: siteConfig.url }],
  creator: 'thedevroom',
  publisher: 'LexAI',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'LexAI — Despacho jurídico de inteligencia artificial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: 'black-translucent',
  },
};