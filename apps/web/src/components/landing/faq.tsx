'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BASE_DISCLAIMER } from '@lexai/shared';

const faqs = [
  {
    q: 'Does LexAI replace a lawyer?',
    a: 'No. LexAI provides general legal guidance with professional rigor, but it does not establish a binding attorney–client relationship. For critical decisions, consult a licensed attorney.',
  },
  {
    q: 'What legislation does it cover?',
    a: 'Spanish law as the foundation, with adaptations for Latin America. 9 areas: employment, civil, criminal, family, tax, traffic, consumer, commercial, and immigration.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. AES-256-GCM encryption, GDPR compliance, granular consent, and user-encrypted case files.',
  },
  {
    q: 'Can I generate legal documents?',
    a: 'Yes, on Pro and Enterprise plans. Certified letters, dismissal notices, appeals, contracts, and more — ready for review and signature.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center font-display text-3xl font-bold">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="rounded-xl border border-white/[0.08] bg-lex-bg-secondary/50"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left font-medium"
                aria-expanded={open === i}
              >
                {faq.q}
                <span className="text-lex-accent-gold">{open === i ? '−' : '+'}</span>
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all',
                  open === i ? 'max-h-48 pb-5' : 'max-h-0',
                )}
              >
                <p className="px-5 text-sm text-lex-text-secondary">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-lex-risk-medium/20 bg-lex-risk-medium/5 p-6">
          <p className="text-xs leading-relaxed text-lex-text-muted">
            <strong className="text-lex-risk-medium">Legal notice:</strong> {BASE_DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  );
}