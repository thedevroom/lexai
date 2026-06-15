const siteUrl = process.env['WEB_URL'] ?? 'https://lexai-bay.vercel.app';

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LexAI',
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  description:
    'Despacho digital de inteligencia artificial jurídica en español con 9 áreas especializadas.',
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
    description: 'Consulta básica gratuita',
  },
  description:
    'Plataforma SaaS de asesoramiento jurídico con IA: laboral, civil, penal, fiscal y más.',
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