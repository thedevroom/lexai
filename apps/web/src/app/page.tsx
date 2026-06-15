import { LandingScrollAnimations } from '@/components/landing/landing-scroll-animations';
import { ProductDemo } from '@/components/landing/product-demo';
import { Comparison } from '@/components/landing/comparison';
import { FAQ } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { Hero } from '@/components/landing/hero';
import { LegalAreasGrid } from '@/components/landing/legal-areas-grid';
import { Navbar } from '@/components/landing/navbar';
import { Pricing } from '@/components/landing/pricing';
import { Problems } from '@/components/landing/problems';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <LandingScrollAnimations>
        <main id="main-content">
          <Hero />
          <Problems />
          <LegalAreasGrid />
          <ProductDemo />
          <Comparison />
          <Pricing />
          <FAQ />
        </main>
      </LandingScrollAnimations>
      <Footer />
    </>
  );
}