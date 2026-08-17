"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/*
 * Entrance reveals.
 *
 * Two shapes, matching the two the reference ships its hero markup in:
 *
 *  - FadeReveal   — starts at opacity 0.001 and fades up in place.
 *  - RiseReveal   — starts fully below its own box and slides up behind an
 *                   overflow-hidden mask, so it wipes into view.
 *
 * The near-zero (rather than exactly zero) start opacity is deliberate: it
 * keeps the text rendered and measurable for layout and for screen readers
 * before the animation runs.
 *
 * TIMINGS ARE PROVISIONAL. The reference ships these elements in their initial
 * state with the animation driven from JS we have not observed running, so the
 * durations and the inter-element delay below are a considered guess. They are
 * collected here so a single edit retunes the whole hero once we have a
 * reference recording of page load.
 */

const DURATION = 0.8;
const EASE = [0.23, 1, 0.32, 1] as const;

/** Delay between consecutive hero elements. */
export const STEP = 0.09;

export function FadeReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0.001, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function RiseReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={`block w-full overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}
