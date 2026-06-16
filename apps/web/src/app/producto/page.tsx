import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingPage } from '@/components/marketing/marketing-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Product',
  description: 'LexAI features: AI consultations, documents, legal drafts, and voice.',
};

const features = [
  { title: '9 specialized agents', desc: 'Employment, civil, criminal, family, tax, and more — each with tailored prompts and legislation.' },
  { title: 'Document analysis', desc: 'Upload contracts, dismissal letters, or complaints. Risk traffic light and legal citations.' },
  { title: 'Legal draft generation', desc: 'Formal notices, court forms, claims, and appeals with versioning and optional human review.' },
  { title: 'Deadlines and alerts', desc: 'Due-date timeline with critical urgency for SMAC, appeals, and limitation periods.' },
  { title: 'Voice consultation', desc: 'LiveKit sessions with transcription and post-call summary (with GDPR consent).' },
  { title: 'GDPR compliance', desc: 'Granular consent, Art. 20 export, Art. 17 deletion, and full audit trail.' },
];

export default function ProductoPage() {
  return (
    <MarketingPage
      title="A full law firm in the cloud"
      subtitle="LexAI combines legal rigor, state-of-the-art AI, and premium design for citizens and law firms."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <CardTitle className="text-lg">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-lex-text-secondary">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Button asChild size="lg">
          <Link href="/#demo">Watch 60-second demo</Link>
        </Button>
      </div>
    </MarketingPage>
  );
}