import type { Metadata } from 'next';
import { MarketingPage } from '@/components/marketing/marketing-page';

export const metadata: Metadata = {
  title: 'Security',
  description: 'LexAI security practices and compliance.',
};

const items = [
  { title: 'Encryption', body: 'TLS 1.3 in transit. Documents protected with AES-256-GCM and per-user envelope encryption.' },
  { title: 'Authentication', body: 'bcrypt passwords (12 rounds). JWTs signed with secret rotation.' },
  { title: 'Infrastructure', body: 'Data hosted in the EU. Encrypted backups. Health checks and anti-abuse rate limiting.' },
  { title: 'Audit', body: 'Immutable log of sensitive actions with 7-year retention.' },
  { title: 'Responsible AI', body: 'Mandatory disclaimers. Mock mode avoids sending data to third parties in development.' },
];

export default function SeguridadPage() {
  return (
    <MarketingPage
      title="Security and trust"
      subtitle="Architecture designed for sensitive legal data and regulatory compliance."
    >
      <ul className="space-y-6">
        {items.map((item) => (
          <li key={item.title} className="rounded-xl border border-white/[0.06] bg-lex-bg-secondary/40 p-6">
            <h3 className="font-display text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-lex-text-secondary">{item.body}</p>
          </li>
        ))}
      </ul>
    </MarketingPage>
  );
}