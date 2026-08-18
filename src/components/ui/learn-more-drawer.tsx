"use client";

import { useState } from "react";
import { OdometerText } from "@/components/motion/odometer-text";
import { Connector } from "@/components/ui/connector";
import { ReadmeOverlay } from "@/components/ui/readme-overlay";

/*
 * Learn more drawer trigger.
 *
 * Fixed to the bottom-right corner: a label stacked over a square icon button,
 * joined by a horizontal connector so the pair reads as one object. Shares the
 * odometer hover with the rest of the site's controls — the parent owns
 * --odometer-progress, so one hover rolls the whole label.
 *
 * Owns the README overlay's open state; the icon rotates into a close
 * affordance while it is up.
 */
export function LearnMoreDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ReadmeOverlay open={open} onClose={() => setOpen(false)} />

      <div
        /* Hidden while the overlay is up, which carries its own close control. */
        className={`fixed right-8 bottom-8 z-4 transition-opacity lg:right-16 lg:bottom-16 ${
          open ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={[
            "inline-flex w-fit min-w-0 shrink-0 cursor-pointer flex-col items-end whitespace-nowrap",
            "font-mono text-ui uppercase",
            "[--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]",
            "*:data-label:inline-flex *:data-label:h-22 *:data-label:items-center",
            "*:data-label:justify-center *:data-label:rounded-4 *:data-label:px-8",
            "*:data-icon:inline-flex *:data-icon:size-48 *:data-icon:items-center",
            "*:data-icon:justify-center *:data-icon:rounded-4",
            "*:data-label:bg-ghost-grey *:data-icon:bg-ghost-grey",
            "*:data-connector:text-ghost-grey",
            "*:data-label:text-black *:data-icon:text-black",
          ].join(" ")}
        >
          <span data-label="true">
            <OdometerText>Learn more</OdometerText>
          </span>

          <span data-connector="true" className="flex w-48 justify-center">
            <Connector orientation="horizontal" length={28} />
          </span>

          <span data-icon="true">
            <span
              aria-hidden="true"
              className={`text-body-20 leading-none transition-transform duration-300 ${
                open ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
