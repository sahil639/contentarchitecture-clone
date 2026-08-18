"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { OdometerText } from "@/components/motion/odometer-text";
import { Connector } from "@/components/ui/connector";
import { README_SECTIONS } from "@/content/readme";

/*
 * README overlay.
 *
 * A tall reading panel pinned to the right edge with a contents card tucked
 * against its left shoulder, over a dimmed page. The panel scrolls; the card
 * and the close control stay put.
 *
 * Panel width is published as --readme-w so the contents card can sit exactly
 * against the panel's edge without either measuring the other.
 */

const EASE = [0.23, 1, 0.32, 1] as const;

function CloseButton({ onClose }: { onClose: () => void }) {
  /*
   * The inverse of the Learn more trigger: icon above label rather than below,
   * and dark on light rather than light on dark.
   */
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className={[
        "inline-flex w-fit shrink-0 cursor-pointer flex-col items-center whitespace-nowrap",
        "font-mono text-ui uppercase",
        "[--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]",
        "*:data-icon:inline-flex *:data-icon:size-44 *:data-icon:items-center",
        "*:data-icon:justify-center *:data-icon:rounded-4",
        "*:data-label:inline-flex *:data-label:h-22 *:data-label:items-center",
        "*:data-label:justify-center *:data-label:rounded-4 *:data-label:px-8",
        "*:data-icon:bg-black *:data-label:bg-black",
        "*:data-connector:text-black",
        "*:data-icon:text-off-white *:data-label:text-off-white",
      ].join(" ")}
    >
      <span data-icon="true">X</span>
      <span data-connector="true" className="flex w-44 justify-center">
        <Connector orientation="horizontal" length={26} />
      </span>
      <span data-label="true">
        <OdometerText>Close</OdometerText>
      </span>
    </button>
  );
}

function Contents({ onJump }: { onJump: (id: string) => void }) {
  return (
    <nav
      aria-label="Contents"
      className="pointer-events-auto w-[240px] max-w-[38vw] overflow-hidden rounded-8 bg-mid-grey p-12 text-black shadow-lg"
    >
      <ul className="flex flex-col gap-6">
        {README_SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onJump(section.id)}
              className="flex w-full cursor-pointer items-baseline gap-8 text-left font-mono text-caption-10 uppercase text-black transition-opacity hover:opacity-60"
            >
              <span className="shrink-0">{section.number}</span>
              <span aria-hidden="true" className="shrink-0 opacity-50">
                /
              </span>
              {/* Titles are clipped rather than wrapped, so every row is one line. */}
              <span className="truncate">{section.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ReadmeOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Escape closes, and the page behind must not scroll while this is up. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const jump = (id: string) => {
    const target = scrollRef.current?.querySelector(`#readme-${id}`);
    target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-10 [--readme-w:min(1000px,50vw)]"
          role="dialog"
          aria-modal="true"
          aria-label="Readme"
        >
          <motion.div
            className="absolute inset-0 bg-black-deep/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Contents card, tucked against the panel's left shoulder. */}
          <motion.div
            className="pointer-events-none absolute top-16 right-[calc(var(--readme-w)+var(--spacing)*16)] hidden items-center lg:flex"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35, delay: 0.08, ease: EASE }}
          >
            <Contents onJump={jump} />
            {/* Joins the card to the panel, so the pair reads as one surface. */}
            <span className="text-mid-grey">
              <Connector orientation="vertical" length={72} />
            </span>
          </motion.div>

          <motion.div
            className="absolute inset-y-16 right-16 flex w-[var(--readme-w)] max-w-[calc(100%-var(--spacing)*32)] flex-col overflow-hidden rounded-8 bg-mid-grey text-black shadow-lg"
            initial={reduced ? { opacity: 1 } : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 32 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-16 px-24 pt-24 lg:px-32 lg:pt-32">
              <div>
                <p className="font-mono text-body-20 uppercase">
                  Readme <span className="opacity-40">/</span> The content
                  architecture
                </p>
                <p className="mt-8 font-mono text-caption-10 uppercase text-dark-grey">
                  A personal note from the maintainer
                </p>
              </div>
              <CloseButton onClose={onClose} />
            </div>

            <div
              ref={scrollRef}
              className="mt-24 flex-1 overflow-y-auto overscroll-contain px-24 pb-32 lg:px-32"
            >
              {README_SECTIONS.map((section) => (
                <section
                  key={section.id}
                  id={`readme-${section.id}`}
                  /* Rule above each section, so the header is separated too. */
                  className="border-t border-black/15 pt-32 pb-16 first:pt-24"
                >
                  <h2 className="mb-20 font-mono text-body-20 uppercase">
                    {section.number} <span className="opacity-40">/</span>{" "}
                    {section.title}
                  </h2>
                  <div className="flex flex-col gap-16">
                    {section.blocks.map((block, i) =>
                      block.kind === "text" ? (
                        <p key={i} className="text-body-20 leading-relaxed">
                          {block.content}
                        </p>
                      ) : (
                        <figure key={i} className="mt-8">
                          {/* Placeholder standing in for the showreel. */}
                          <div className="flex aspect-video w-full items-center justify-center rounded-4 bg-black/10 ring-1 ring-black/15 ring-inset">
                            <span className="font-mono text-caption-10 uppercase text-dark-grey">
                              {block.caption}
                            </span>
                          </div>
                        </figure>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
