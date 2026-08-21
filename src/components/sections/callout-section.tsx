import { Panel } from "@/components/ui/panel";
import {
  CALLOUT_ASCII,
  CALLOUT_COLUMNS,
} from "@/content/callout-ascii";

/*
 * Closing callout.
 *
 * A figlet banner set in the panel's own monospace, scaled so the block spans
 * the panel exactly at any width.
 *
 * The fit is done in CSS rather than by measuring: the panel is a query
 * container, so one font size derived from its inline size and the banner's
 * column count keeps the block flush to both edges with no layout pass and no
 * resize listener.
 *
 * Below a floor the glyphs stop being readable, so the size clamps there and
 * the block scrolls sideways instead of shrinking further.
 */

/* Advance width of one monospace glyph, as a fraction of the font size. */
const GLYPH_ADVANCE = 0.6;
const MIN_FONT_PX = 3.5;

const FIT = `max(${MIN_FONT_PX}px, calc(100cqi / ${CALLOUT_COLUMNS * GLYPH_ADVANCE}))`;

export function CalloutSection({ id }: { id: string }) {
  return (
    <section
      id={id}
      data-section="callout"
      className="bg-off-white px-16 py-96 text-black lg:px-80 lg:py-160"
    >
      <Panel frame="p-7 lg:p-10">
        <div className="flex flex-col">
          <p className="shrink-0 border-white/10 border-b px-16 py-12 font-mono text-caption-10 uppercase tracking-wide text-white/40 lg:px-20">
            The content architecture
          </p>

          <div className="@container overflow-x-auto px-16 py-32 lg:px-20 lg:py-48">
            {/* The banner is decorative; the heading it spells is read instead. */}
            <h2 className="sr-only">The next 3 days are yours.</h2>
            <pre
              aria-hidden="true"
              style={{ fontSize: FIT }}
              className="w-max font-mono leading-[1.08] text-white"
            >
              {CALLOUT_ASCII}
            </pre>
          </div>
        </div>
      </Panel>
    </section>
  );
}
