'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Scale } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-lex-accent-gold/20 bg-lex-accent-gold/5 px-4 py-1.5 text-sm text-lex-accent-gold"
        >
          <Scale size={14} aria-hidden />
          Premium digital law firm · Spain & LatAm
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
        >
          <span className="font-serif italic text-gradient-gold">Elite</span>
          {' '}justice
          <br />
          accessible for everyone
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-lex-text-secondary md:text-xl"
        >
          9 specialized AI lawyers with the rigor of a senior partner.
          Analysis, drafting, and advice 24/7 — no hourly fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild size="lg">
            <Link href="/login">
              Free chat
              <ArrowRight size={18} aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="#demo">Watch 60s demo</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { n: '€0', l: 'per basic consultation' },
            { n: '<30s', l: 'document analysis' },
            { n: '24/7', l: 'availability' },
            { n: '9', l: 'legal practice areas' },
          ].map((stat) => (
            <div
              key={stat.l}
              className="rounded-xl border border-white/[0.06] bg-lex-bg-secondary/40 px-4 py-5"
            >
              <p className="font-display text-2xl font-semibold text-lex-text-primary">{stat.n}</p>
              <p className="mt-1 text-xs text-lex-text-muted">{stat.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}