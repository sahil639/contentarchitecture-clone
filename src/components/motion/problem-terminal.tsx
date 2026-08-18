"use client";

import { useEffect, useRef, useState } from "react";
import { useTypewriter } from "@/components/motion/use-typewriter";
import { Panel } from "@/components/ui/panel";

/*
 * Problem terminal.
 *
 * A console listing the work a project repeats every time. Lines type in one
 * after another once the panel scrolls into view, closing with a summary tally
 * and a cursor that keeps blinking once the run is done.
 *
 * Every row reserves its finished size from the first frame by laying out an
 * invisible copy of the full text, with the typed characters painted over it.
 * Holding a bare line box is not enough: a row that wraps once complete would
 * still grow the panel partway through the run.
 *
 * Body type is a fixed 14px rather than a fluid step. The rows are monospace
 * and sized to sit on one line each, so letting the size grow with the viewport
 * would wrap the longest of them at wide widths.
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
  const { typed, total, slice } = useTypewriter({
    lines: stream,
    charMs: CHAR_MS,
    linePauseMs: LINE_PAUSE_MS,
    startDelayMs: START_DELAY_MS,
    active,
  });

  const state = slice();
  const summaryState = state[state.length - 1];
  const finished = typed >= total;

  return (
    <div ref={ref}>
      <Panel
        frame="p-7 lg:p-10"
        innerClassName="selection:bg-white selection:text-black"
      >
        <div className="px-16 pt-14 pb-16 lg:px-20 lg:pt-16 lg:pb-20">
          <p className="font-mono text-[14px] uppercase tracking-wide text-dark-grey">
            {title}
          </p>
          <hr className="mt-12 border-white/12" />

          {/* The full list is exposed to assistive tech regardless of typing state. */}
          <ol className="sr-only">
            {lines.map((line) => (
              <li key={line.number}>{line.text}</li>
            ))}
          </ol>

          <div aria-hidden="true" className="mt-16 flex flex-col gap-2">
            {lines.map((line, i) => {
              const row = state[i];
              return (
                <div
                  key={line.number}
                  className="flex gap-16 font-mono text-[14px] leading-relaxed"
                >
                  <span
                    className={`shrink-0 text-dark-grey ${row.started ? "" : "invisible"}`}
                  >
                    {line.number}
                  </span>
                  <span className="relative min-w-0 flex-1">
                    {/* Reserves the finished height, wrapping included. */}
                    <span className="invisible">{line.text}</span>
                    <span className="absolute inset-0 text-off-white">
                      {row.text}
                      {row.isActive && <Cursor />}
                    </span>
                  </span>
                </div>
              );
            })}

            <p className="relative mt-16 font-mono text-[14px] leading-relaxed uppercase">
              <span className="invisible">{summary}</span>
              <span className="absolute inset-0 text-white">
                {summaryState.text}
                {/* Rests at the end of the run rather than disappearing with it. */}
                {(summaryState.isActive || finished) && <Cursor />}
              </span>
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
