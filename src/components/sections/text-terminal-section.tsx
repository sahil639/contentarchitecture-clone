import { FadeReveal, STEP } from "@/components/motion/reveal";
import {
  ProblemTerminal,
  type TerminalLine,
} from "@/components/motion/problem-terminal";

/*
 * Text terminal section.
 *
 * Terminal on the left, argument on the right. Copy is placeholder text kept at
 * roughly the lengths the layout is tuned for.
 */

const LINES: TerminalLine[] = [
  { number: "001", text: "Agent redesigns the architecture on every prompt" },
  { number: "002", text: "Page builder schema + section registration + preview" },
  { number: "003", text: "Draft mode + live preview + webhook revalidation" },
  { number: "004", text: "CDN vs. data cache — stale content after publish" },
  { number: "005", text: "Studio structure editors can actually use" },
  { number: "006", text: "SEO metadata, OG images, sitemaps, robots.txt" },
  { number: "007", text: "Rewriting the same 12 components" },
  { number: "008", text: "Redirects, analytics, view transitions, Mux" },
  { number: "009", text: "Contact form + spam guard + Resend wiring" },
  { number: "010", text: "ESLint, Prettier, Biome, git hooks" },
  { number: "011", text: "Basic auth for staging environments" },
];

const SUMMARY = "Estimated time lost: ~24 hours per project  (3 full days)";

export function TextTerminalSection({ id }: { id: string }) {
  return (
    <section
      id={id}
      data-section="text-terminal"
      className="grid grid-cols-1 items-center gap-x-16 gap-y-48 bg-off-white px-16 py-96 text-black lg:grid-cols-12 lg:px-80 lg:py-160"
    >
      <div className="lg:col-span-5">
        <ProblemTerminal
          title="Common problems"
          lines={LINES}
          summary={SUMMARY}
        />
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        <FadeReveal delay={0}>
          <h2 className="text-balance font-medium text-headline-10">
            The page builder alone costs you days. Every single time.
          </h2>
        </FadeReveal>

        <FadeReveal delay={STEP} className="mt-24 flex flex-col gap-16">
          <p className="text-body-20 text-dark-grey">
            It&rsquo;s never the easy stuff that hurts. It&rsquo;s the page
            builder, modeled from scratch again. Draft mode and live preview,
            wired up and subtly broken again. The cache bug where published
            content goes stale and the client swears you shipped something
            wrong. A Studio structure your editors actually understand, instead
            of one they email you about.
          </p>
          <p className="text-body-20 text-dark-grey">
            This is the part nobody quotes for and everybody rebuilds. Days gone
            before the real work starts.
          </p>
        </FadeReveal>
      </div>
    </section>
  );
}
