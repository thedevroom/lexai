'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FileText, X } from 'lucide-react';
import { RiskSemaphore } from '@/components/design-system/risk-semaphore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

const DEMO_DOCS = [
  { id: '1', filename: 'contrato_arrendamiento.pdf', riskScore: 6.2, semaphore: 'YELLOW' as const, summary: 'Potentially abusive deposit clause. Review art. 36 LAU.' },
  { id: '2', filename: 'email_despido.pdf', riskScore: 8.1, semaphore: 'RED' as const, summary: 'Signs of unfair dismissal. SMAC deadline: 20 business days.' },
  { id: '3', filename: 'politica_privacidad.pdf', riskScore: 2.0, semaphore: 'GREEN' as const, summary: 'Generally GDPR compliant. Improve data transfer clause.' },
];

export default function DocumentsPage() {
  const { data: casesData } = trpc.cases.list.useQuery({ limit: 1 });
  const caseId = casesData?.cases[0]?.id;
  const { data: docs } = trpc.documents.listByCase.useQuery(
    { caseId: caseId ?? '' },
    { enabled: !!caseId },
  );

  const [selected, setSelected] = useState<(typeof DEMO_DOCS)[0] | null>(null);
  const displayDocs = docs?.length ? docs.map((d) => ({
    id: d.id,
    filename: d.filename,
    riskScore: d.analysis?.riskScore ?? 5,
    semaphore: (d.analysis?.semaphore ?? 'YELLOW') as 'GREEN' | 'YELLOW' | 'RED',
    summary: d.analysis?.summary ?? 'Analysis pending',
  })) : DEMO_DOCS;

  return (
    <main className="p-8">
      <h1 className="mb-2 font-display text-3xl font-bold">Document analysis</h1>
      <p className="mb-8 text-lex-text-secondary">
        Review the legal risk of your contracts and legal documents with a visual traffic-light indicator.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayDocs.map((doc) => (
          <Card
            key={doc.id}
            className="cursor-pointer transition-colors hover:border-lex-accent-gold/30"
            onClick={() => setSelected(doc)}
          >
            <CardHeader className="flex flex-row items-start justify-between">
              <FileText className="text-lex-accent-gold" size={24} aria-hidden />
              <RiskSemaphore semaphore={doc.semaphore} score={doc.riskScore} size="sm" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">{doc.filename}</p>
              <p className="mt-2 line-clamp-2 text-sm text-lex-text-secondary">{doc.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog.Root open={!!selected} onOpenChange={() => setSelected(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-lex-bg-elevated p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <Dialog.Title className="font-display text-xl font-semibold">
                {selected?.filename}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" aria-label="Close">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>
            {selected && (
              <div className="mt-6 space-y-4">
                <RiskSemaphore semaphore={selected.semaphore} score={selected.riskScore} size="lg" />
                <p className="text-sm leading-relaxed text-lex-text-secondary">{selected.summary}</p>
                <div className="rounded-xl border border-lex-risk-medium/20 bg-lex-risk-medium/5 p-4">
                  <p className="text-xs font-semibold text-lex-risk-medium">Highlighted clause</p>
                  <p className="mt-2 text-sm italic text-lex-text-secondary">
                    &quot;The tenant expressly waives any right to judicial action…&quot;
                  </p>
                </div>
                <Button variant="outline" disabled>Export PDF report</Button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}