"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
 * Runs a character counter across a set of lines as one continuous stream, so
 * callers can slice it back into whatever layout they need.
 *
 * Scheduled with a chained timeout rather than an interval, so the pause at a
 * line break can differ from the cadence within a line without the whole run
 * drifting.
 */
export function useTypewriter({
  lines,
  charMs,
  linePauseMs = 0,
  startDelayMs = 0,
  active = true,
}: {
  lines: string[];
  charMs: number;
  linePauseMs?: number;
  startDelayMs?: number;
  /** Held false until the caller wants the run to begin. */
  active?: boolean;
}) {
  const reduced = useReducedMotion();
  const total = lines.reduce((n, l) => n + l.length, 0);
  const [typed, setTyped] = useState(0);

  /*
   * Keyed on the line lengths as a string rather than the array: callers
   * usually build the array inline, and a fresh identity each render would tear
   * down and restart the run on every typed character.
   */
  const shape = lines.map((l) => l.length).join(",");
  const shapeRef = useRef(shape);
  shapeRef.current = shape;

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setTyped(total);
      return;
    }

    const lengths = shapeRef.current.split(",").map(Number);
    let cancelled = false;
    let count = 0;

    const step = () => {
      if (cancelled) return;
      count += 1;
      setTyped(count);
      if (count >= total) return;

      let consumed = 0;
      let atBreak = false;
      for (const len of lengths) {
        consumed += len;
        if (count === consumed) {
          atBreak = true;
          break;
        }
      }
      setTimeout(step, atBreak ? charMs + linePauseMs : charMs);
    };

    const start = setTimeout(step, startDelayMs);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [active, reduced, total, charMs, linePauseMs, startDelayMs]);

  /** Slices the flat count back into per-line state. */
  const slice = () => {
    let consumed = 0;
    return lines.map((line) => {
      const shown = Math.max(0, Math.min(line.length, typed - consumed));
      const isActive = typed > consumed && typed < consumed + line.length;
      const isDone = typed >= consumed + line.length;
      consumed += line.length;
      return { text: line.slice(0, shown), isActive, isDone, started: shown > 0 };
    });
  };

  return { typed, total, slice };
}
