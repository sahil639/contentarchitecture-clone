import Link from "next/link";
import { OdometerText } from "@/components/motion/odometer-text";
import { Marquee } from "@/components/ui/marquee";

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
   * Concentric arcs, echoing the hero vortex at a glyph's scale.
   */
  return (
    <span
      aria-hidden="true"
      className="flex size-32 shrink-0 items-center justify-center rounded-4 bg-off-white"
    >
      <svg viewBox="0 0 24 24" className="size-20" fill="none">
        <title>Mark</title>
        {[3, 6, 9, 12].map((r) => (
          <path
            key={r}
            d={`M ${12 - r} 20 A ${r} ${r} 0 0 1 ${12 + r} 20`}
            stroke="#232323"
            strokeWidth="1.6"
          />
        ))}
      </svg>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-4 flex justify-start p-8 lg:justify-center lg:p-16">
      <nav
        aria-label="Primary"
        /* w-fit so the pill hugs the nav row; the marquee below is clipped to that width. */
        className="pointer-events-auto w-fit max-w-full overflow-hidden rounded-8 bg-black-deep shadow-lg ring ring-black-deep"
      >
        <div className="flex items-center gap-8 px-12 py-10 lg:gap-24 lg:px-16">
          <Link href="/" aria-label="Home">
            <Mark />
          </Link>

          <ul className="flex items-center gap-16 lg:gap-28">
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
                      className="absolute -top-2 -right-6 size-4 rounded-full bg-accent"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/10 py-6">
          <Marquee>Now available with Astro</Marquee>
        </div>
      </nav>
    </header>
  );
}
