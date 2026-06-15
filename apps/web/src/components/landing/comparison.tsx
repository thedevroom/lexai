'use client';

import { GlassCard } from '@/components/design-system/glass-card';

const rows = [
  { label: 'Coste consulta', lexai: 'Desde €0', trad: '€150-500/hora' },
  { label: 'Tiempo de respuesta', lexai: '< 30 segundos', trad: '2-14 días' },
  { label: 'Disponibilidad', lexai: '24/7/365', trad: 'Horario oficina' },
  { label: 'Análisis documentos', lexai: 'Incluido', trad: '€300+ por contrato' },
  { label: 'Especialistas', lexai: '9 áreas simultáneas', trad: '1 especialidad' },
];

export function Comparison() {
  return (
    <section className="px-6 py-24" data-scroll="reveal">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center font-display text-3xl font-bold">
          LexAI vs abogado tradicional
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
                  Tradicional
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