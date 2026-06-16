import type { Metadata } from 'next';

const siteUrl = process.env['WEB_URL'] ?? 'https://lexai-bay.vercel.app';

export const siteConfig = {
  name: 'LexAI',
  title: 'LexAI — AI-Powered Legal Law Firm',
  description:
    'Premium digital law firm with 9 specialized AI lawyers. Legal analysis, document drafting, and advice 24/7 under Spanish law.',
  url: siteUrl,
  ogImage: `${siteUrl}/og-image.png`,
  twitterHandle: '@thedevroom',
  keywords: [
    'legaltech',
    'legal artificial intelligence',
    'AI lawyer',
    'Spanish law',
    'legal advice',
    'GDPR',
    'digital law firm',
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
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'LexAI — AI-powered legal law firm',
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