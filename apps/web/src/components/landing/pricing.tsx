'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    monthly: 19,
    annual: 15,
    features: ['10 consultas/mes', '5 análisis de documentos', '1 área jurídica'],
  },
  {
    name: 'Pro',
    monthly: 49,
    annual: 39,
    featured: true,
    features: [
      'Consultas ilimitadas',
      '20 análisis de documentos',
      '9 áreas jurídicas',
      'Generación de escritos',
      '60 min voz/mes',
    ],
  },
  {
    name: 'Enterprise',
    monthly: 149,
    annual: 119,
    features: [
      'Todo en Pro',
      'Voz ilimitada',
      'API access',
      'Soporte prioritario',
      'RGPD enterprise',
    ],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="px-6 py-24" data-scroll="reveal">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold">Precios transparentes</h2>
          <p className="mt-3 text-lex-text-secondary">
            Sin honorarios por hora. Sin sorpresas.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-lex-bg-secondary p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                !annual ? 'bg-lex-accent-gold text-lex-bg-primary' : 'text-lex-text-secondary',
              )}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                annual ? 'bg-lex-accent-gold text-lex-bg-primary' : 'text-lex-text-secondary',
              )}
            >
              Anual <span className="text-xs opacity-80">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'rounded-2xl border p-8',
                plan.featured
                  ? 'border-lex-accent-gold/50 bg-lex-accent-gold/5 shadow-lg shadow-lex-accent-gold/10'
                  : 'border-white/[0.08] bg-lex-bg-secondary/50',
              )}
            >
              {plan.featured && (
                <span className="mb-4 inline-block rounded-full bg-lex-accent-gold px-3 py-1 text-xs font-semibold text-lex-bg-primary">
                  Más popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <p className="mt-4 font-display text-4xl font-bold">
                €{annual ? plan.annual : plan.monthly}
                <span className="text-base font-normal text-lex-text-muted">/mes</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-lex-text-secondary">
                    <Check className="shrink-0 text-lex-accent-gold" size={16} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.featured ? 'default' : 'secondary'}
                className="mt-8 w-full"
              >
                <Link href="/login">Empezar</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}