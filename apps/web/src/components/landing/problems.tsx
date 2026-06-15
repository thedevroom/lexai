'use client';

import { Clock, FileX, HelpCircle, Landmark } from 'lucide-react';
import { GlassCard } from '@/components/design-system/glass-card';

const problems = [
  {
    icon: Clock,
    title: 'Abogado = caro y lento',
    desc: '€150-500/hora. Cita en 2 semanas. El 78% evita ir por el coste.',
  },
  {
    icon: HelpCircle,
    title: 'Google no basta',
    desc: 'Información genérica que no aplica a su caso concreto.',
  },
  {
    icon: Landmark,
    title: 'Justicia para pocos',
    desc: 'PYMEs y particulares sin el mismo nivel legal que las grandes empresas.',
  },
  {
    icon: FileX,
    title: 'Contratos incomprensibles',
    desc: 'El 91% firma sin entender. Un análisis básico cuesta €300+.',
  },
];

export function Problems() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">
          El problema que resolvemos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p, i) => (
            <GlassCard key={p.title} delay={i * 0.08} data-scroll="problem-card">
              <p.icon className="mb-4 text-lex-accent-gold" size={24} aria-hidden />
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-lex-text-secondary">{p.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}