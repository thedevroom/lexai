'use client';

import { Download, FileOutput } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DEMO_ESCRITOS = [
  { id: '1', title: 'Unfair dismissal letter', type: 'CARTA_DESPIDO', version: 2, date: 'Jun 12, 2026' },
  { id: '2', title: 'Traffic fine appeal', type: 'RECURSO_MULTA', version: 1, date: 'Jun 10, 2026' },
  { id: '3', title: 'Residence permit application', type: 'SOLICITUD_NACIONALIDAD', version: 1, date: 'Jun 8, 2026' },
];

export default function EscritosPage() {
  return (
    <main className="p-8">
      <h1 className="mb-2 font-display text-3xl font-bold">Generated legal drafts</h1>
      <p className="mb-8 text-lex-text-secondary">
        Legal documents drafted by LexAI, ready for review and signature.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {DEMO_ESCRITOS.map((escrito) => (
          <Card key={escrito.id}>
            <CardHeader className="flex flex-row items-start gap-4">
              <FileOutput className="shrink-0 text-lex-accent-gold" size={28} aria-hidden />
              <div className="flex-1">
                <CardTitle className="text-base">{escrito.title}</CardTitle>
                <div className="mt-2 flex gap-2">
                  <Badge variant="gold">{escrito.type.replace(/_/g, ' ')}</Badge>
                  <Badge>v{escrito.version}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-lex-text-muted">Generated on {escrito.date}</p>
              <div className="rounded-xl border border-white/[0.06] bg-lex-bg-primary p-4 text-xs text-lex-text-secondary">
                <p className="font-semibold text-lex-text-primary">Preview</p>
                <p className="mt-2">
                  [NAME], ID [XXX], appearing before the competent authority, states as follows:…
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" disabled>
                  <Download size={14} aria-hidden />
                  PDF
                </Button>
                <Button variant="ghost" size="sm">View history</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}