'use client';

import { GlassCard } from '@/components/design-system/glass-card';

const rows = [
  { label: 'Consultation cost', lexai: 'From €0', trad: '€150–500/hour' },
  { label: 'Response time', lexai: '< 30 seconds', trad: '2–14 days' },
  { label: 'Availability', lexai: '24/7/365', trad: 'Office hours' },
  { label: 'Document analysis', lexai: 'Included', trad: '€300+ per contract' },
  { label: 'Specialists', lexai: '9 areas at once', trad: '1 specialty' },
];

export function Comparison() {
  return (
    <section className="px-6 py-24" data-scroll="reveal">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center font-display text-3xl font-bold">
          LexAI vs. traditional lawyer
        </h2>
        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left font-medium text-lex-text-muted" scope="col" />
                <th className="p-4 text-center font-semibold text-lex-accent-gold" scope="col">
                  LexAI
                </th>
                <th className="p-4 text-center font-medium text-lex-text-muted" scope="col">
                  Traditional
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-white/5 last:border-0">
                  <td className="p-4 text-lex-text-secondary">{row.label}</td>
                  <td className="p-4 text-center font-medium text-lex-text-primary">{row.lexai}</td>
                  <td className="p-4 text-center text-lex-text-muted">{row.trad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </section>
  );
}