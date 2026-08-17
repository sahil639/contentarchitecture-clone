"use client";

/*
 * Scroll cue.
 *
 * A dashed vertical track with a block that ticks down it in seven discrete
 * steps, like a progress readout rather than a smooth glide. With reduced
 * motion the block simply rests at the bottom of the track.
 */
export function ScrollCue({ targetId }: { targetId: string }) {
  return (
    <button
      type="button"
      aria-label="Scroll to the next section"
      onClick={() =>
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="group absolute bottom-40 left-[calc(50%_+_8px)] hidden -translate-x-1/2 cursor-pointer flex-col items-center rounded-4 bg-black-deep px-8 py-10 ring-1 ring-white/20 ring-inset transition-shadow hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-white/60 lg:flex"
    >
      <span
        aria-hidden="true"
        className="relative block h-48 w-6 overflow-hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0 1px, transparent 1px 8px)",
        }}
      >
        <span className="absolute inset-x-0 top-0 h-6 animate-hero-scroll-cue bg-white/90 transition-colors group-hover:bg-white motion-reduce:hidden" />
        <span className="absolute inset-x-0 bottom-0 hidden h-6 bg-white/90 motion-reduce:block" />
      </span>
    </button>
  );
}
