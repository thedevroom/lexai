'use client';

import { Clock, FileX, HelpCircle, Landmark } from 'lucide-react';
import { GlassCard } from '@/components/design-system/glass-card';

const problems = [
  {
    icon: Clock,
    title: 'Lawyers = expensive and slow',
    desc: '€150–500/hour. Appointments in 2 weeks. 78% avoid going due to cost.',
  },
  {
    icon: HelpCircle,
    title: 'Google is not enough',
    desc: 'Generic information that does not apply to your specific case.',
  },
  {
    icon: Landmark,
    title: 'Justice for the few',
    desc: 'SMBs and individuals lack the same legal support as large corporations.',
  },
  {
    icon: FileX,
    title: 'Incomprehensible contracts',
    desc: '91% sign without understanding. A basic review costs €300+.',
  },
];

export function Problems() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">
          The problem we solve
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