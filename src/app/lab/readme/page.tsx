"use client";

import { useState } from "react";
import { ReadmeOverlay } from "@/components/ui/readme-overlay";

/* Isolation harness: the overlay open, so its layout can be checked at rest. */
export default function ReadmeLabPage() {
  const [open, setOpen] = useState(true);

  return (
    <main className="min-h-dvh bg-off-white p-32">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-8 bg-black px-20 py-12 font-mono text-caption-10 uppercase text-off-white"
      >
        Open readme
      </button>
      <ReadmeOverlay open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
