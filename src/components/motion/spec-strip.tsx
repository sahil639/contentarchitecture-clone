"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
 * Spec strip.
 *
 * The row of status readouts under the hero copy. They type in on load as one
 * continuous run — the whole strip behaves like a single line being entered,
 * crossing from the end of one label straight into the next, with a block
 * cursor riding the write head.
 *
 * Each label reserves its final width with an invisible copy of its text, so
 * the row is laid out at its final size from the first frame and nothing
 * reflows as characters arrive.
 */

/* ~12 characters a second, measured off the reference capture. */
const CHAR_MS = 80;
/* Beat between labels, so each reads as its own entry. */
const LABEL_PAUSE_MS = 120;
const START_DELAY_MS = 260;

function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.12em] bg-current align-baseline motion-safe:animate-cursor-blink"
    />
  );
}

export function SpecStrip({ rows }: { rows: string[][] }) {
  const reduced = useReducedMotion();
  const labels = rows.flat();

  /* Characters typed so far, counted across the whole strip. */
  const total = labels.reduce((n, l) => n + l.length, 0);
  const [typed, setTyped] = useState(0);

  /*
   * The effect keys off the label lengths as a string rather than the label
   * array: rows.flat() allocates a fresh array on every render, which would
   * tear down and restart the run on each typed character.
   */
  const shape = labels.map((l) => l.length).join(",");

  useEffect(() => {
    if (reduced) {
      setTyped(total);
      return;
    }

    const lengths = shape.split(",").map(Number);
    let cancelled = false;
    let count = 0;

    /*
     * Scheduled with a chained timeout rather than an interval, so the pause
     * between labels can vary without drifting the cadence within one.
     */
    const step = () => {
      if (cancelled) return;
      count += 1;
      setTyped(count);
      if (count >= total) return;

      let consumed = 0;
      let atBoundary = false;
      for (const len of lengths) {
        consumed += len;
        if (count === consumed) {
          atBoundary = true;
          break;
        }
      }
      setTimeout(step, atBoundary ? CHAR_MS + LABEL_PAUSE_MS : CHAR_MS);
    };

    const start = setTimeout(step, START_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [shape, total, reduced]);

  /* Walk the flat character count back into a per-label slice. */
  let consumed = 0;
  const sliceFor = (label: string) => {
    const shown = Math.max(0, Math.min(label.length, typed - consumed));
    const isActive = typed > consumed && typed < consumed + label.length;
    consumed += label.length;
    return { text: label.slice(0, shown), isActive };
  };

  return (
    <div className="font-mono text-caption-10 uppercase">
      <span className="sr-only">{labels.join(" ")}</span>
      <div aria-hidden="true" className="flex flex-col gap-y-4">
        {rows.map((row, r) => (
          <div
            key={r}
            className="flex flex-wrap items-baseline justify-between gap-x-16 gap-y-4"
          >
            {row.map((label) => {
              const { text, isActive } = sliceFor(label);
              return (
                <span
                  key={label}
                  className="relative inline-block whitespace-pre"
                >
                  {/* Holds the final width so the row never reflows. */}
                  <span className="invisible">{label}</span>
                  <span className="absolute inset-y-0 left-0 whitespace-pre">
                    {text}
                    {isActive && <Cursor />}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
