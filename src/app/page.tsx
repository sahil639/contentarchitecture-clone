import { HeroSection } from "@/components/sections/hero-section";
import { TextTerminalSection } from "@/components/sections/text-terminal-section";
import { IdeSection } from "@/components/sections/ide-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { SiteHeader } from "@/components/ui/site-header";
import { LearnMoreDrawer } from "@/components/ui/learn-more-drawer";

export default function Home() {
  return (
    <main className="relative z-1 flex flex-1 flex-col bg-black">
      <SiteHeader />
      <LearnMoreDrawer />
      <HeroSection nextSectionId="text-terminal" />
      <TextTerminalSection id="text-terminal" />
      {/* Section 3 (benefits) intentionally skipped for now. */}
      <IdeSection id="the-repo" />
      {/* Section 5 (showcase) intentionally skipped for now. */}
      <PricingSection id="pricing" />
    </main>
  );
}
