import Link from "next/link";
import { Button } from "@/components/ui/button";

// Import Layout Components
import { SiteHeader } from "@/components/site-header"; 
import { SiteFooter } from "@/components/site-footer"; 

// Import Section Components
import { HeroSection } from "@/components/landing/hero-section";
import { BentoFeatures } from "@/components/landing/bento-features";
import { AboutSection } from "@/components/landing/about-section";
import { EventShowcase } from "@/components/landing/event-showcase";
import { VotingTeaser } from "@/components/landing/voting-teaser";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      <SiteHeader />

      <main>
        <HeroSection />
        <AboutSection />
        <BentoFeatures />
        <EventShowcase />
        <VotingTeaser />

        <section className="py-12 bg-slate-50 text-center border-t border-slate-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
              Siap Mengubah Cara Anda Mengelola Kompetisi?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-10 text-lg">
              Bergabunglah dengan kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-red-900 hover:bg-red-800 text-md text-white px-8 h-14 rounded-full shadow-xl shadow-red-900/10" asChild>
                <Link href="/register">Hubungi Kami</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

    </div>
  );
}