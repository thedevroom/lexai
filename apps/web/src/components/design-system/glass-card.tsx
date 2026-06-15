'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  'data-scroll'?: string;
}

export function GlassCard({
  children,
  className,
  hover = false,
  delay = 0,
  'data-scroll': dataScroll,
}: GlassCardProps) {
  const hoverProps = hover
    ? { whileHover: { y: -4, transition: { duration: 0.2 } } }
    : {};

  const scrollDriven = Boolean(dataScroll);
  const entranceProps = scrollDriven
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] as const },
      };

  return (
    <motion.div
      {...entranceProps}
      {...hoverProps}
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-lex-bg-glass p-6 backdrop-blur-md',
        hover && 'cursor-default transition-shadow hover:border-white/15 hover:shadow-lg hover:shadow-lex-accent-gold/5',
        className,
      )}
      {...(dataScroll ? { 'data-scroll': dataScroll } : {})}
    >
      {children}
    </motion.div>
  );
}