'use client';

/**
 * GSAP ScrollTrigger — subtle animations with narrative purpose:
 *
 * 1. Problems: each card enters in sequence (frustration → visual solution)
 * 2. Legal areas: staggered reveal by row (specialist catalog)
 * 3. Comparison + Pricing: fade-up on viewport entry (purchase decision)
 *
 * Respects prefers-reduced-motion. Does not alter existing visual styling.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LandingScrollAnimations({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-scroll="problem-card"]').forEach((el, i) => {
          gsap.from(el, {
            x: -28,
            autoAlpha: 0,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.08,
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-scroll="area-card"]').forEach((el, i) => {
          gsap.from(el, {
            y: 32,
            autoAlpha: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
            },
            delay: (i % 3) * 0.1,
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-scroll="reveal"]').forEach((el) => {
          gsap.from(el, {
            y: 24,
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          });
        });
      }, rootRef);

      return () => ctx.revert();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}