import { HeroSection } from "@/components/sections/hero-section";
import { SiteHeader } from "@/components/ui/site-header";

export default function Home() {
  return (
    <main className="relative z-1 flex flex-1 flex-col bg-black">
      <SiteHeader />
      <HeroSection nextSectionId="text-terminal" />

      {/* Placeholder so the scroll cue has somewhere to go. */}
      <section
        id="text-terminal"
        className="flex min-h-svh items-center justify-center bg-black"
      >
        <p className="font-mono text-caption-10 uppercase text-dark-grey">
          Next section
        </p>
      </section>
    </main>
  );
}
