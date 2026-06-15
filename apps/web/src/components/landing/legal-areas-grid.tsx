'use client';

import { LEGAL_AREAS } from '@lexai/shared';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/design-system/glass-card';

export function LegalAreasGrid() {
  return (
    <section id="areas" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-lex-accent-gold">
            Especialistas
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            9 senior partners digitales
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lex-text-secondary">
            Cada área con legislación española actualizada, metodología IRAC y jurisprudencia en tiempo real.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEGAL_AREAS.map((area, i) => (
            <GlassCard key={area.id} hover delay={i * 0.05} className="group relative" data-scroll="area-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">{area.label}</h3>
                  <p className="mt-1 text-sm text-lex-accent-gold">{area.agentName}</p>
                </div>
                <ArrowUpRight
                  className="text-lex-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  size={18}
                  aria-hidden
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-lex-text-secondary">
                {area.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {area.legislation.slice(0, 2).map((law) => (
                  <span
                    key={law}
                    className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-lex-text-muted"
                  >
                    {law}
                  </span>
                ))}
              </div>
              {area.strictDisclaimer && (
                <p className="mt-3 text-[10px] text-lex-risk-medium">Disclaimer reforzado</p>
              )}
            </GlassCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-lex-accent-gold hover:underline"
          >
            Probar consulta gratuita →
          </Link>
        </div>
      </div>
    </section>
  );
}