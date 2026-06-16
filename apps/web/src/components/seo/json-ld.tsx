const siteUrl = process.env['WEB_URL'] ?? 'https://lexai-bay.vercel.app';

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LexAI',
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  description:
    'AI-powered digital law firm with 9 specialized practice areas.',
  sameAs: ['https://github.com/thedevroom/lexai'],
};

const software = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LexAI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Free basic consultation',
  },
  description:
    'AI legal assistance SaaS platform: employment, civil, criminal, tax, and more.',
  url: siteUrl,
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
    </>
  );
}