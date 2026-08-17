import { FadeReveal, RiseReveal, STEP } from "@/components/motion/reveal";
import { SpecStrip } from "@/components/motion/spec-strip";
import { SplitButton } from "@/components/ui/split-button";
import { ScrollCue } from "@/components/ui/scroll-cue";

/*
 * Hero.
 *
 * Twelve-column split on desktop: copy on columns 1-5, media panel on 7-12.
 * On mobile it stacks, with the media panel pinned to a fixed 80vh row so it
 * keeps a deliberate proportion instead of collapsing to its content.
 *
 * Copy is placeholder text standing in for real content, kept at roughly the
 * lengths the layout is tuned for.
 */

const SPEC_ROWS = [
  ["NEXT 16.x", "ASTRO 7.x", "SANITY v6", "TS: STRICT"],
  ["AGENTS.MD: LOADED", "MCP: 2 SERVERS", "DRIFT: 0"],
];

export function HeroSection({ nextSectionId }: { nextSectionId: string }) {
  return (
    <section
      data-section="hero"
      className="relative grid min-h-svh grid-cols-1 grid-rows-[auto_80vh] gap-x-16 bg-off-white text-black lg:grid-cols-12 lg:grid-rows-1"
    >
      <div className="flex flex-col gap-48 px-16 pt-160 pb-48 lg:col-span-5 lg:justify-center lg:pt-64 lg:pr-0 lg:pl-80">
        <div className="my-auto">
          <FadeReveal
            delay={0}
            className="mb-20 font-mono text-caption-20 uppercase"
          >
            Built for agentic development.
          </FadeReveal>

          <FadeReveal delay={STEP} className="mb-32">
            <h1 className="text-balance font-medium text-headline-20">
              The Sanity setup agents don&rsquo;t reinvent.
            </h1>
          </FadeReveal>

          <FadeReveal
            delay={STEP * 2}
            className="w-full text-body-20 text-dark-grey"
          >
            <p>
              Every run invents a new one, none decided. This kit commits six
              years of decisions. Your agent builds inside them, and checks its
              work through MCP and a real Chrome.
            </p>
          </FadeReveal>

          <RiseReveal delay={STEP * 3} className="mt-32">
            <SplitButton href="#pricing" leading="Get" trailing="access" ping />
          </RiseReveal>
        </div>

        <div className="hidden lg:block">
          <SpecStrip rows={SPEC_ROWS} />
        </div>
      </div>

      {/*
       * Media panel. The reference leaves this empty server-side and fills it
       * on the client, so its contents are still unknown — see the note in the
       * hero README. Kept as a bare black panel until we know what belongs.
       */}
      <div className="relative overflow-hidden bg-black lg:col-span-6 lg:col-start-7 lg:aspect-auto">
        <div className="absolute inset-0 size-full" />
      </div>

      <ScrollCue targetId={nextSectionId} />
    </section>
  );
}
