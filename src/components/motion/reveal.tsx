"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

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
   * The mask is only needed while the child is sliding up through it. Its
   * bottom edge sits exactly on the child's, so left in place it shaves the
   * child's lower corners and shadow — hence dropping it once the wipe ends.
   *
   * Cleared on a timer as well as on the animation callback: the callback does
   * not fire if the animation never runs to completion, and a permanently
   * clipped control is a worse failure than dropping the mask a frame early.
   */
  const [wiping, setWiping] = useState(!reduced);

  useEffect(() => {
    if (!wiping) return;
    const ms = (delay + DURATION) * 1000 + 120;
    const timer = setTimeout(() => setWiping(false), ms);
    return () => clearTimeout(timer);
  }, [wiping, delay]);

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
