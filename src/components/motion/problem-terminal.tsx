"use client";

import { useEffect, useRef, useState } from "react";
import { useTypewriter } from "@/components/motion/use-typewriter";

/*
 * Problem terminal.
 *
 * A console listing the work a project repeats every time. Lines type in one
 * after another once the panel scrolls into view, with a block cursor on the
 * line currently being written, and close with a summary tally.
 *
 * Rows are only rendered once their line has started, so the panel grows as the
 * list fills rather than reserving its final height up front.
 */

const CHAR_MS = 23;
const LINE_PAUSE_MS = 90;
const START_DELAY_MS = 200;

export type TerminalLine = { number: string; text: string };

function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-off-white align-baseline motion-safe:animate-cursor-blink"
    />
  );
}

export function ProblemTerminal({
  title,
  lines,
  summary,
}: {
  title: string;
  lines: TerminalLine[];
  summary: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  /* The run starts when the panel first comes into view, and never restarts. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stream = [...lines.map((l) => l.text), summary];
  const { slice } = useTypewriter({
    lines: stream,
    charMs: CHAR_MS,
    linePauseMs: LINE_PAUSE_MS,
    startDelayMs: START_DELAY_MS,
    active,
  });

  const state = slice();
  const summaryState = state[state.length - 1];

  return (
    <div
      ref={ref}
      className="w-full rounded-8 bg-black-deep p-16 shadow-lg ring-1 ring-white/12 lg:p-20"
    >
      <p className="font-mono text-ui uppercase tracking-wide text-dark-grey">
        {title}
      </p>

      {/* The full list is exposed to assistive tech regardless of typing state. */}
      <ol className="sr-only">
        {lines.map((line) => (
          <li key={line.number}>{line.text}</li>
        ))}
      </ol>

      <div aria-hidden="true" className="mt-12 flex flex-col gap-2">
        {lines.map((line, i) => {
          const row = state[i];
          if (!row.started) return null;
          return (
            <div
              key={line.number}
              className="flex gap-12 font-mono text-ui leading-relaxed"
            >
              <span className="shrink-0 text-dark-grey">{line.number}</span>
              <span className="text-off-white">
                {row.text}
                {row.isActive && <Cursor />}
              </span>
            </div>
          );
        })}

        {summaryState.started && (
          <p className="mt-12 font-mono text-ui uppercase text-dark-grey">
            {summaryState.text}
            {summaryState.isActive && <Cursor />}
          </p>
        )}
      </div>
    </div>
  );
}
