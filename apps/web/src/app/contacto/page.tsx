import type { Metadata } from 'next';
import { MarketingPage } from '@/components/marketing/marketing-page';
import { COMPANY_EMAIL, DPO_EMAIL } from '@/lib/legal-content';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the LexAI team.',
};

export default function ContactoPage() {
  return (
    <MarketingPage
      title="Let's talk"
      subtitle="Technical support, partnerships, press, and exercising your GDPR rights."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">General support</h3>
            <a href={`mailto:${COMPANY_EMAIL}`} className="mt-2 block text-lex-accent-gold hover:underline">
              {COMPANY_EMAIL}
            </a>
            <p className="mt-4 text-sm text-lex-text-muted">Response within 24–48 business hours.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Data Protection Officer</h3>
            <a href={`mailto:${DPO_EMAIL}`} className="mt-2 block text-lex-accent-gold hover:underline">
              {DPO_EMAIL}
            </a>
            <p className="mt-4 text-sm text-lex-text-muted">Access, erasure, and portability (GDPR).</p>
          </CardContent>
        </Card>
      </div>
    </MarketingPage>
  );
}