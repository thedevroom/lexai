'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MousePointer2, Pause, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEMO_DURATION_MS = 60_000;

interface DemoStep {
  at: number;
  scene: 'home' | 'login' | 'area' | 'chat' | 'result';
  cursor?: { x: number; y: number };
  click?: boolean;
  label?: string;
}

const STEPS: DemoStep[] = [
  { at: 0, scene: 'home', label: 'Welcome' },
  { at: 3000, scene: 'home', cursor: { x: 72, y: 38 }, click: true, label: 'Start consultation' },
  { at: 5000, scene: 'login', label: 'Quick sign-up' },
  { at: 9000, scene: 'login', cursor: { x: 50, y: 55 }, click: true },
  { at: 12000, scene: 'area', label: 'Select practice area' },
  { at: 15000, scene: 'area', cursor: { x: 28, y: 42 }, click: true },
  { at: 18000, scene: 'chat', label: 'Employment consultation' },
  { at: 22000, scene: 'chat', cursor: { x: 85, y: 78 }, click: true },
  { at: 28000, scene: 'result', label: 'AI analysis' },
  { at: 45000, scene: 'result', label: 'Deadlines and next steps' },
  { at: 55000, scene: 'home', label: 'Ready to get started' },
];

function SceneContent({ scene }: { scene: DemoStep['scene'] }) {
  if (scene === 'home') {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="font-display text-2xl font-bold">LexAI</p>
        <p className="mt-2 text-sm text-lex-text-muted">AI-powered law firm</p>
        <div className="mt-8 rounded-lg bg-lex-accent-gold/20 px-6 py-2 text-sm text-lex-accent-gold">
          Free chat →
        </div>
      </div>
    );
  }
  if (scene === 'login') {
    return (
      <div className="flex h-full flex-col justify-center px-10">
        <p className="font-semibold">Create account</p>
        <div className="mt-4 space-y-3">
          <div className="h-9 rounded-lg border border-white/10 bg-lex-bg-primary/60 px-3 text-xs leading-9 text-lex-text-muted">
            maria@empresa.es
          </div>
          <div className="h-9 rounded-lg border border-white/10 bg-lex-bg-primary/60 px-3 text-xs leading-9">
            ••••••••
          </div>
          <div className="h-9 rounded-lg bg-lex-accent-gold text-center text-xs font-medium leading-9 text-lex-bg-primary">
            Sign up
          </div>
        </div>
      </div>
    );
  }
  if (scene === 'area') {
    return (
      <div className="grid h-full grid-cols-3 gap-3 p-6">
        {['Employment', 'Civil', 'Criminal', 'Family', 'Tax', 'Traffic'].map((a, i) => (
          <div
            key={a}
            className={cn(
              'flex items-center justify-center rounded-lg border text-xs',
              i === 0 ? 'border-lex-accent-gold bg-lex-accent-gold/10 text-lex-accent-gold' : 'border-white/10 text-lex-text-muted',
            )}
          >
            {a}
          </div>
        ))}
      </div>
    );
  }
  if (scene === 'chat') {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="flex-1 space-y-3 overflow-hidden">
          <div className="ml-auto max-w-[80%] rounded-xl rounded-tr-sm bg-lex-accent-gold/20 p-3 text-xs">
            I was dismissed without notice or severance after 8 years. What can I do?
          </div>
          <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-white/10 bg-lex-bg-elevated p-3 text-xs text-lex-text-secondary">
            Analyzing your employment case…
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-8 flex-1 rounded-lg border border-white/10 bg-lex-bg-primary/40" />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lex-accent-gold text-lex-bg-primary">→</div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3 overflow-auto p-5 text-xs">
      <p className="font-semibold text-lex-accent-gold">Assessment — Unfair dismissal</p>
      <p className="text-lex-text-secondary">
        SMAC deadline: <strong className="text-lex-risk-medium">12 days</strong> · Risk: medium
      </p>
      <ul className="list-inside list-disc space-y-1 text-lex-text-muted">
        <li>Request dismissal letter via certified mail</li>
        <li>File conciliation request</li>
        <li>Severance: 33 days per year of service</li>
      </ul>
    </div>
  );
}

export function ProductDemo() {
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [scene, setScene] = useState<DemoStep['scene']>('home');
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [clicking, setClicking] = useState(false);
  const [label, setLabel] = useState('60-second demo');
  const startRef = useRef<number>(Date.now());
  const stepIndexRef = useRef(0);

  const applyStep = useCallback((step: DemoStep) => {
    setScene(step.scene);
    if (step.label) setLabel(step.label);
    if (step.cursor) setCursor(step.cursor);
    if (step.click) {
      setClicking(true);
      setTimeout(() => setClicking(false), 400);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;

    startRef.current = Date.now() - elapsed;
    const interval = setInterval(() => {
      const e = Date.now() - startRef.current;
      if (e >= DEMO_DURATION_MS) {
        setElapsed(DEMO_DURATION_MS);
        setPlaying(false);
        return;
      }
      setElapsed(e);

      while (stepIndexRef.current < STEPS.length && STEPS[stepIndexRef.current]!.at <= e) {
        applyStep(STEPS[stepIndexRef.current]!);
        stepIndexRef.current += 1;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [playing, applyStep, elapsed]);

  const restart = () => {
    stepIndexRef.current = 0;
    setElapsed(0);
    setScene('home');
    setCursor(null);
    setLabel('60-second demo');
    setPlaying(true);
    applyStep(STEPS[0]!);
  };

  const progress = (elapsed / DEMO_DURATION_MS) * 100;
  const secondsLeft = Math.ceil((DEMO_DURATION_MS - elapsed) / 1000);

  return (
    <section id="demo" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-lex-accent-gold">Interactive demo</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            See LexAI in action
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lex-text-secondary">
            A guided 60-second walkthrough: sign-up, practice area selection, consultation, and AI legal analysis.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-lex-bg-secondary shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-lex-bg-elevated px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="flex-1 text-center text-xs text-lex-text-muted">app.lexai.es — {label}</span>
              <span className="text-xs tabular-nums text-lex-accent-gold">{secondsLeft}s</span>
            </div>

            <div className="relative aspect-[16/10] bg-lex-bg-primary">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <SceneContent scene={scene} />
                </motion.div>
              </AnimatePresence>

              {cursor && (
                <motion.div
                  className="pointer-events-none absolute z-10"
                  animate={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                >
                  <MousePointer2
                    size={22}
                    className={cn('text-white drop-shadow-lg', clicking && 'scale-90')}
                  />
                  {clicking && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      className="absolute left-0 top-0 h-8 w-8 rounded-full border-2 border-lex-accent-gold"
                    />
                  )}
                </motion.div>
              )}
            </div>

            <div className="h-1 bg-lex-bg-elevated">
              <motion.div
                className="h-full bg-gradient-to-r from-lex-accent-gold to-amber-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? 'Pause' : 'Resume'}
            </Button>
            <Button size="sm" variant="outline" onClick={restart}>
              <RotateCcw size={16} />
              Restart demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}