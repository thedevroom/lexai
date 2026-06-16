export const LEGAL_VERSION = '1.0';
export const LEGAL_EFFECTIVE_DATE = 'June 15, 2026';
export const COMPANY_NAME = 'LexAI Technologies S.L.';
export const COMPANY_ADDRESS = 'Calle de la Justicia Digital, 1, 28001 Madrid, España';
export const COMPANY_EMAIL = 'legal@lexai.es';
export const DPO_EMAIL = 'dpo@lexai.es';

export const COOKIE_POLICY_SECTIONS = [
  {
    id: 'que-son',
    title: '1. What are cookies?',
    content:
      'Cookies are small text files stored on your device when you visit lexai.es. ' +
      'They help remember preferences, maintain secure sessions, and—only with your consent—measure platform usage.',
  },
  {
    id: 'tipos',
    title: '2. Types of cookies we use',
    content:
      '**Strictly necessary:** JWT authentication, consent preferences, and CSRF security. These do not require consent.\n\n' +
      '**Functional:** Language, theme, and onboarding state.\n\n' +
      '**Analytics (optional):** Aggregated navigation metrics to improve the product. Activated only if you accept "Analytics cookies".\n\n' +
      '**Marketing (optional):** Remarketing and personalized newsletters. Require explicit consent.',
  },
  {
    id: 'gestion',
    title: '3. Management and withdrawal',
    content:
      'You can accept, reject, or configure cookies from the initial banner or in Settings → Privacy. ' +
      'You may also delete cookies from your browser. Withdrawal does not affect the lawfulness of prior processing.',
  },
  {
    id: 'terceros',
    title: '4. Third-party cookies',
    content:
      'In production we may use Stripe (payments), Sentry (error monitoring), and Resend (transactional email). ' +
      'Each provider has its own privacy policy in compliance with the GDPR.',
  },
];

export const PRIVACY_SECTIONS = [
  {
    id: 'responsable',
    title: '1. Data controller',
    content: `${COMPANY_NAME}\n${COMPANY_ADDRESS}\nEmail: ${DPO_EMAIL}`,
  },
  {
    id: 'datos',
    title: '2. Data we process',
    content:
      'Identification (email, name), encrypted credentials, legal case files, AI consultations, encrypted documents (AES-256-GCM), ' +
      'GDPR consents, audit logs, billing data (Stripe), and—optionally—voice recordings with explicit consent.',
  },
  {
    id: 'finalidad',
    title: '3. Purpose and legal basis',
    content:
      'Provision of the digital legal service (contract performance, Art. 6(1)(b) GDPR). ' +
      'Legal compliance and audit (legal obligation, Art. 6(1)(c)). ' +
      'Product improvement and analytics (consent, Art. 6(1)(a)). ' +
      'Commercial communications (consent, Art. 6(1)(a)).',
  },
  {
    id: 'retencion',
    title: '4. Retention periods',
    content:
      'Consultations: 2 years · Documents: 3 years · Audit logs: 7 years · Consents: 7 years · Voice: 1 year (with consent).',
  },
  {
    id: 'derechos',
    title: '5. Your rights',
    content:
      'Access, rectification, erasure, portability, objection, and restriction. ' +
      'Exercise them in Settings → Export data / Delete account or by emailing ' + DPO_EMAIL + '. ' +
      'You may lodge a complaint with the AEPD (www.aepd.es).',
  },
  {
    id: 'ia',
    title: '6. AI processing',
    content:
      'Consultations may be processed using AI models (xAI Grok or a local engine). ' +
      'They do not replace advice from a licensed attorney. Prompts are not used to train third-party models without consent.',
  },
];

export const TERMS_SECTIONS = [
  {
    id: 'objeto',
    title: '1. Purpose',
    content:
      'These Terms govern access to and use of LexAI, an AI-powered legal assistance SaaS platform. ' +
      'By registering, you accept these terms in their current version.',
  },
  {
    id: 'servicio',
    title: '2. Nature of the service',
    content:
      'LexAI provides automated legal guidance. **It does not create an attorney-client relationship** unless professional services are expressly contracted. ' +
      'Responses include mandatory legal disclaimers.',
  },
  {
    id: 'cuentas',
    title: '3. Accounts and plans',
    content:
      'You must provide accurate information. FREE, STARTER, PROFESSIONAL, and ENTERPRISE plans have usage limits described on the pricing page. ' +
      'Non-payment may result in suspended access.',
  },
  {
    id: 'uso',
    title: '4. Prohibited use',
    content:
      'Prohibited activities include: unlawful use, mass scraping, reverse engineering, impersonation, spam, or attempts to bypass rate limits and anti-abuse controls.',
  },
  {
    id: 'propiedad',
    title: '5. Intellectual property',
    content:
      'LexAI retains rights to the platform. You retain ownership of your documents and case files. ' +
      'You grant us a limited license to process them solely to provide the service.',
  },
  {
    id: 'limitacion',
    title: '6. Limitation of liability',
    content:
      'The service is provided "as is". We do not guarantee procedural outcomes. ' +
      'Maximum liability is limited to fees paid in the 12 months preceding the incident.',
  },
  {
    id: 'ley',
    title: '7. Governing law',
    content: 'Spanish law applies. Jurisdiction: courts of Madrid, subject to mandatory consumer protection rules.',
  },
];

export const LEGAL_NOTICE_SECTIONS = [
  {
    id: 'titular',
    title: 'Website owner',
    content: `${COMPANY_NAME}\nNIF: B12345678\n${COMPANY_ADDRESS}\nContact: ${COMPANY_EMAIL}`,
  },
  {
    id: 'registro',
    title: 'Commercial register',
    content: 'Registered with the Madrid Commercial Register, Volume 00000, Folio 000, Sheet M-000000.',
  },
  {
    id: 'alojamiento',
    title: 'Hosting',
    content: 'EU cloud infrastructure (Frankfurt/Ireland region) with TLS 1.3 encryption in transit and AES-256 at rest.',
  },
];