import Link from "next/link";
import { OdometerText } from "@/components/motion/odometer-text";
import { Marquee } from "@/components/ui/marquee";
import { Panel } from "@/components/ui/panel";

/*
 * Site header.
 *
 * A floating pill centred over the hero, holding the mark, the primary nav, and
 * an announcement marquee along its bottom edge. Fixed and pointer-transparent
 * so it never blocks the hero beneath it; the pill itself re-enables pointer
 * events.
 */

const NAV = [
  { label: "Features", href: "#features" },
  { label: "The repo", href: "#the-repo" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing", accent: true },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog" },
];

function Mark() {
  /*
   * A fan of hatched strokes radiating from the lower-left, echoing the hero
   * vortex at a glyph's scale. Drawn as arcs of increasing radius about a
   * corner origin rather than as concentric rings about the centre.
   */
  const RAYS = 9;

  return (
    <span
      aria-hidden="true"
      className="flex size-26 shrink-0 items-center justify-center rounded-2 bg-white/10"
    >
      <svg viewBox="0 0 24 24" className="size-20" fill="none">
        <title>Mark</title>
        {Array.from({ length: RAYS }, (_, i) => {
          const r = 3 + i * 2.4;
          return (
            <path
              key={i}
              d={`M 2 ${22 - r} A ${r} ${r} 0 0 1 ${2 + r} 22`}
              stroke="rgba(241,238,231,0.85)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-4 flex justify-start p-8 lg:justify-center lg:p-16">
      {/* w-fit so the pill hugs the nav row; the marquee below is clipped to that width. */}
      <Panel frame="p-7 lg:p-10" className="pointer-events-auto w-fit max-w-full">
        <nav aria-label="Primary">
          <div className="flex items-center gap-12 px-10 py-6 lg:gap-22 lg:px-12">
          <Link href="/" aria-label="Home">
            <Mark />
          </Link>

          <ul className="flex items-center gap-14 lg:gap-22">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="relative inline-flex font-mono text-caption-10 uppercase text-off-white/80 transition-colors hover:text-off-white [--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]"
                >
                  <OdometerText>{item.label}</OdometerText>
                  {item.accent && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-6 size-4 rounded-full bg-accent"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
          </div>

          <div className="border-t border-white/10">
            <Marquee>Now available with Astro</Marquee>
          </div>
        </nav>
      </Panel>
    </header>
  );
}
