import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/landing/site-frame";
import { PillNav } from "@/components/landing/pill-nav";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeatureCards } from "@/components/landing/feature-cards";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockSense — Inventory Operating System" },
      { name: "description", content: "Know what you have. Understand what happens next. One precise workspace for stock visibility, warehouse operations, and explainable decisions." },
      { property: "og:title", content: "StockSense — Inventory Operating System" },
      { property: "og:description", content: "Real-time inventory management with AI-powered risk detection and explainable recommendations." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative w-full overflow-x-hidden bg-[oklch(0.10_0.03_255)]">
      <SiteFrame />
      <PillNav />
      <main id="main-content">
        <Hero />
        <StatsBar />
        <FeatureCards />
        <HowItWorks />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
