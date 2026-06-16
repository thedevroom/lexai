import type { Metadata } from 'next';
import { MarketingPage } from '@/components/marketing/marketing-page';
import { COMPANY_NAME, COMPANY_ADDRESS } from '@/lib/legal-content';

export const metadata: Metadata = {
  title: 'Company',
  description: 'LexAI mission and values.',
};

export default function EmpresaPage() {
  return (
    <MarketingPage
      title="Accessible justice, responsible technology"
      subtitle={`${COMPANY_NAME} was founded to close the gap between elite legal services and the people who need them most.`}
    >
      <div className="prose prose-invert mx-auto max-w-none space-y-8 text-lex-text-secondary">
        <section className="rounded-2xl border border-white/[0.06] bg-lex-bg-secondary/40 p-8">
          <h2 className="font-display text-2xl font-semibold text-lex-text-primary">Our mission</h2>
          <p className="mt-4 leading-relaxed">
            Democratize access to high-quality legal guidance through specialized AI,
            always with transparency, legal disclaimers, and human oversight when a case requires it.
          </p>
        </section>
        <section className="rounded-2xl border border-white/[0.06] bg-lex-bg-secondary/40 p-8">
          <h2 className="font-display text-2xl font-semibold text-lex-text-primary">Values</h2>
          <ul className="mt-4 list-inside list-disc space-y-2">
            <li><strong className="text-lex-text-primary">Rigor:</strong> IRAC analysis and verifiable statutory citations.</li>
            <li><strong className="text-lex-text-primary">Privacy:</strong> AES-256 encryption, GDPR by design.</li>
            <li><strong className="text-lex-text-primary">Accessibility:</strong> plans from €0 for basic consultations.</li>
          </ul>
        </section>
        <p className="text-center text-sm text-lex-text-muted">{COMPANY_ADDRESS}</p>
      </div>
    </MarketingPage>
  );
}