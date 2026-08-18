import type { ReactNode } from "react";

/*
 * Panel.
 *
 * The site's recurring surface: a textured frame around a solid interior. The
 * frame is a 2px checkerboard laid down with a repeating conic gradient — four
 * quadrants per 4px tile, two of them lit — which reads as a halftone screen at
 * normal viewing distance.
 *
 * The texture lives on the outer element and shows only through its padding, so
 * the band width is the padding value. Content sits on the solid inner surface.
 */

const HALFTONE = {
  backgroundImage:
    "repeating-conic-gradient(rgba(255,255,255,0.22) 0% 25%, transparent 0% 50%)",
  backgroundSize: "4px 4px",
} as const;

export function Panel({
  children,
  className,
  innerClassName,
  frame = "p-6 lg:p-8",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Padding utilities setting the texture band's width. */
  frame?: string;
}) {
  return (
    <div
      style={HALFTONE}
      className={`rounded-8 bg-black-deep shadow-lg ring ring-black-deep ${frame} ${className ?? ""}`}
    >
      <div className={`overflow-hidden rounded-4 bg-black-deep ${innerClassName ?? ""}`}>
        {children}
      </div>
    </div>
  );
}
