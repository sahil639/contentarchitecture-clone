"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";

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
 * Timings are measured off the reference load capture: the copy begins a beat
 * after the shell settles, and eyebrow through button resolve over about half a
 * second in all.
 */

const DURATION = 0.55;
const EASE = [0.23, 1, 0.32, 1] as const;

/** Delay before the first element, once the shell is up. */
export const LEAD = 0.3;
/** Delay between consecutive hero elements. */
export const STEP = 0.13;

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
  /*
   * The mask is only needed while the child is sliding up through it. Left in
   * place afterwards it clips anything that overflows the child's box — the
   * button's status dot and its shadow — so it is dropped once the wipe ends.
   */
  const [wiping, setWiping] = useState(!reduced);

  return (
    <div
      className={`block w-full ${wiping ? "overflow-hidden" : ""} ${className ?? ""}`}
    >
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION, delay, ease: EASE }}
        onAnimationComplete={() => setWiping(false)}
      >
        {children}
      </motion.div>
    </div>
  );
}
