"use client";

/*
 * Odometer text.
 *
 * Each character sits in a 1em-tall window over a column of six glyphs: the
 * real character, four random stand-ins, then the real character again. Driving
 * --odometer-progress from 0 to 1 translates the column by -5em, so it lands
 * back on the original glyph after rolling through the decoys.
 *
 * The parent owns --odometer-progress, which lets one hover target drive every
 * character at once:
 *
 *   <span className="[--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]">
 *     <OdometerText>Get access</OdometerText>
 *   </span>
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/* Column height is 6 glyphs; the roll travels the other 5. */
const DECOY_COUNT = 4;
const TRAVEL_EM = DECOY_COUNT + 1;

const DURATION_MS = 520;
const EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

/*
 * Per-character delay, so the label resolves left to right rather than as a
 * block. Uncapped, and spaces consume a slot like any other character. To
 * restart the stagger partway through a label, split it into two components
 * (which is what the connector in ConnectedOdometerButton does).
 */
const STAGGER_MS = 28;

/*
 * Decoys are picked from a seed rather than Math.random so the server and
 * client render identical markup.
 */
function decoysFor(char: string, index: number): string[] {
  const seed = char.charCodeAt(0) + index * 31;
  return Array.from(
    { length: DECOY_COUNT },
    (_, i) => GLYPHS[(seed + (i + 1) * 7) % GLYPHS.length],
  );
}

function OdometerChar({ char, index }: { char: string; index: number }) {
  const delay = index * STAGGER_MS;
  const column = [char, ...decoysFor(char, index), char];

  return (
    <span
      aria-hidden="true"
      className="relative inline-block overflow-hidden align-baseline"
      style={{ height: "1em", lineHeight: "1em" }}
    >
      {/* Reserves the character's advance width without being visible. */}
      <span className="invisible">{char}</span>
      <span
        className="absolute inset-x-0 top-0 flex flex-col motion-safe:transition-transform"
        style={{
          transform: `translateY(calc(var(--odometer-progress, 0) * -${TRAVEL_EM}em))`,
          transitionDuration: `${DURATION_MS}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: EASING,
        }}
      >
        {column.map((glyph, i) => (
          <span
            key={i}
            data-odometer-glyph={glyph}
            className="block"
            style={{ height: "1em", lineHeight: "1em" }}
          >
            {glyph}
          </span>
        ))}
      </span>
    </span>
  );
}

export function OdometerText({ children }: { children: string }) {
  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="flex items-center">
        {Array.from(children).map((char, i) =>
          char === " " ? (
            /* Spaces hold their slot in the stagger but never roll. */
            <span
              key={i}
              aria-hidden="true"
              className="inline-block"
              style={{ height: "1em", lineHeight: "1em" }}
            >
              {" "}
            </span>
          ) : (
            <OdometerChar key={i} char={char} index={i} />
          ),
        )}
      </span>
    </>
  );
}
