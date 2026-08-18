"use client";

/*
 * Marquee.
 *
 * The scrolling announcement strip under the nav. The phrase list is rendered
 * twice back to back and the track is translated by exactly half its width, so
 * the second copy lands where the first began and the loop is seamless.
 *
 * Duration scales with the number of repeats, keeping pixel speed constant no
 * matter how long the phrase is.
 */

const REPEATS = 6;
const SECONDS_PER_REPEAT = 4.5;

export function Marquee({ children }: { children: string }) {
  const items = Array.from({ length: REPEATS }, (_, i) => (
    <span key={i} className="shrink-0 px-16">
      {children}
    </span>
  ));

  return (
    /*
     * w-0 min-w-full keeps the track's very large intrinsic width from
     * widening a w-fit parent: the box contributes nothing to max-content,
     * then stretches back to the width the parent settled on.
     */
    <div className="relative flex w-0 min-w-full overflow-hidden bg-white font-mono text-ui uppercase text-black">
      <span className="sr-only">{children}</span>
      <div
        aria-hidden="true"
        className="flex w-max motion-safe:animate-[marquee_var(--marquee-duration)_linear_infinite]"
        style={
          {
            "--marquee-duration": `${REPEATS * SECONDS_PER_REPEAT}s`,
          } as React.CSSProperties
        }
      >
        {/* Two identical halves; the track shifts by 50% to loop without a seam. */}
        <div className="flex shrink-0">{items}</div>
        <div className="flex shrink-0">{items}</div>
      </div>
    </div>
  );
}
