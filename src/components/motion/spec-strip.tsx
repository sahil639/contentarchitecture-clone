"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
 * Spec strip.
 *
 * The row of status readouts under the hero copy. Each label reserves its final
 * width with an invisible copy of the text, then an absolutely positioned
 * overlay fills in on top of it — so the row never reflows as it settles.
 *
 * BEHAVIOUR IS PROVISIONAL. The reference ships every overlay holding a single
 * zero-width space, which tells us the text arrives from JS but not how. This
 * implements a per-character scramble that resolves left to right; it could
 * equally be a plain typewriter. Needs a reference recording of page load.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.";

/** Frames each character scrambles for before locking to its final value. */
const SCRAMBLE_FRAMES = 3;
const FRAME_MS = 45;
/** Delay before the strip starts, so it trails the copy above it. */
const START_DELAY_MS = 700;

function ScrambleLabel({ text, delay }: { text: string; delay: number }) {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(reduced ? text.length : 0);
  const [tick, setTick] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (reduced) {
      setRevealed(text.length);
      return;
    }

    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        frame.current += 1;
        setTick((t) => t + 1);
        if (frame.current % SCRAMBLE_FRAMES === 0) {
          setRevealed((r) => {
            if (r >= text.length) {
              clearInterval(interval);
              return r;
            }
            return r + 1;
          });
        }
      }, FRAME_MS);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay, reduced]);

  const shown = Array.from(text)
    .map((char, i) => {
      if (i < revealed || char === " ") return char;
      /* Derived from the tick so it scrambles, but stays render-pure. */
      return GLYPHS[(tick * 7 + i * 13) % GLYPHS.length];
    })
    .join("");

  return (
    <span className="relative inline-block whitespace-pre">
      {/* Holds the final width so the row never reflows. */}
      <span className="invisible">{text}</span>
      <span className="absolute inset-y-0 left-0 whitespace-pre">{shown}</span>
    </span>
  );
}

export function SpecStrip({ rows }: { rows: string[][] }) {
  let index = 0;

  return (
    <div className="font-mono text-caption-10 uppercase">
      <span className="sr-only">{rows.flat().join(" ")}</span>
      <div aria-hidden="true" className="flex flex-col gap-y-4">
        {rows.map((row, r) => (
          <div
            key={r}
            className="flex flex-wrap items-baseline justify-between gap-x-16 gap-y-4"
          >
            {row.map((label) => (
              <ScrambleLabel
                key={label}
                text={label}
                delay={START_DELAY_MS + index++ * 90}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
