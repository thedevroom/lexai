import Link from 'next/link';
import { Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Scale className="text-lex-accent-gold" size={24} aria-hidden />
            <span className="font-display text-xl font-semibold">LexAI</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-lex-text-secondary">
            A digital law firm powered by legal artificial intelligence. Democratizing access to
            quality legal advice in Spain and Latin America.
          </p>
          <p className="mt-4 text-xs text-lex-text-muted">
            LexAI does not replace advice from a licensed attorney.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Product</h4>
          <ul className="space-y-2 text-sm text-lex-text-secondary">
            <li><Link href="/producto" className="hover:text-lex-text-primary">Features</Link></li>
            <li><Link href="/#areas" className="hover:text-lex-text-primary">Legal areas</Link></li>
            <li><Link href="/#demo" className="hover:text-lex-text-primary">60s demo</Link></li>
            <li><Link href="/#pricing" className="hover:text-lex-text-primary">Pricing</Link></li>
            <li><Link href="/seguridad" className="hover:text-lex-text-primary">Security</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-lex-text-secondary">
            <li><Link href="/empresa" className="hover:text-lex-text-primary">About us</Link></li>
            <li><Link href="/contacto" className="hover:text-lex-text-primary">Contact</Link></li>
            <li><Link href="/#faq" className="hover:text-lex-text-primary">FAQ</Link></li>
            <li><Link href="/login" className="hover:text-lex-text-primary">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Legal</h4>
          <ul className="space-y-2 text-sm text-lex-text-secondary">
            <li><Link href="/legal/terms" className="hover:text-lex-text-primary">Terms</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-lex-text-primary">Privacy (GDPR)</Link></li>
            <li><Link href="/legal/cookies" className="hover:text-lex-text-primary">Cookies</Link></li>
            <li><Link href="/legal/aviso-legal" className="hover:text-lex-text-primary">Legal notice</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-lex-text-muted md:flex-row">
        <p>© {new Date().getFullYear()} LexAI Technologies S.L. All rights reserved.</p>
        <p>GDPR compliant · LSSI-CE · Data hosted in the EU</p>
      </div>
    </footer>
  );
}