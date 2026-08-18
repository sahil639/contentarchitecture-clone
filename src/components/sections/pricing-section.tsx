import { SplitButton } from "@/components/ui/split-button";
import { AvatarStack } from "@/components/ui/avatar-stack";

/*
 * Pricing section.
 *
 * Each edition is three stacked panels — price, details, action — separated by
 * a hairline gap rather than dividers, so the card reads as assembled parts.
 * A wider panel of shared terms sits underneath both.
 *
 * Copy is placeholder text kept at roughly the lengths the layout is tuned for.
 */

const CHECKOUT_HREF =
  "https://www.youtube.com/watch?v=8Ee4QjCEHHc&list=RDGMEMQ1dJ7wXfLlqCjwV0xfSNbAVMr4l9bFqgMaQ&index=2";

type Edition = {
  id: string;
  label: string;
  price: string;
  wasPrice?: string;
  status: string;
  details: string[];
};

const EDITIONS: Edition[] = [
  {
    id: "next",
    label: "Next.js",
    price: "€399",
    wasPrice: "€549",
    status: "Available now",
    details: [
      "The Next.js 16 + Sanity v6 repo",
      "For Next.js + Sanity engineers, not no-code",
    ],
  },
  {
    id: "astro",
    label: "Astro",
    price: "€399",
    wasPrice: "€549",
    status: "Available now",
    details: [
      "The Astro 7 + Sanity v6 repo",
      "For Astro + Sanity engineers, not no-code",
    ],
  },
];

const INCLUDED = [
  "One-time fee, no subscription",
  "Perpetual license, unlimited projects",
  "Commercial use, no attribution",
  "Lifetime updates, included",
  "Agent-ready: skills, MCP, llms.txt",
  "Private GitHub discussions",
  "Direct line to the maintainer",
  "Full source on purchase, sales final",
  "All prices in EUR",
];

/** Row index rendered as the reference's zero-padded ordinal. */
function ordinal(i: number): string {
  return String(i + 1).padStart(3, "0");
}

function NumberedRow({ index, children }: { index: number; children: string }) {
  return (
    <li className="flex gap-16 break-inside-avoid pb-8 font-mono text-caption-20 uppercase tracking-wide">
      <span aria-hidden="true" className="shrink-0 text-white/30">
        {ordinal(index)}
      </span>
      <span className="text-white/85">{children}</span>
    </li>
  );
}

function EditionCard({ edition }: { edition: Edition }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-8 bg-black px-28 pt-24 pb-32 lg:px-32">
        <div className="flex items-start justify-between gap-16">
          <p className="font-mono text-caption-20 uppercase tracking-wide text-white/35">
            {edition.label}
          </p>
          <p className="flex items-center gap-8 font-mono text-caption-20 uppercase tracking-wide text-white">
            <span aria-hidden="true" className="size-6 rounded-full bg-accent" />
            {edition.status}
          </p>
        </div>

        <p className="mt-20 flex items-baseline gap-16">
          <span className="font-medium text-headline-20 text-white">
            {edition.price}
          </span>
          {edition.wasPrice && (
            <span className="font-mono text-body-20 text-white/40 line-through">
              {edition.wasPrice}
            </span>
          )}
        </p>
      </div>

      <ul className="flex flex-col gap-8 rounded-8 bg-black px-28 py-28 lg:px-32">
        {edition.details.map((detail, i) => (
          <NumberedRow key={detail} index={i}>
            {detail}
          </NumberedRow>
        ))}
      </ul>

      <div className="rounded-8 bg-black px-28 py-28 lg:px-32">
        <SplitButton
          href={CHECKOUT_HREF}
          leading="Get"
          trailing="access"
          tone="light"
        />
      </div>
    </div>
  );
}

export function PricingSection({ id }: { id: string }) {
  return (
    <section
      id={id}
      data-section="pricing"
      className="bg-off-white px-16 py-96 text-black lg:px-80 lg:py-160"
    >
      <div className="flex flex-col gap-32 lg:flex-row lg:items-end lg:justify-between lg:gap-64">
        <h2 className="text-balance font-medium text-headline-10">
          Two editions.
          <br />
          One architecture.
          <br />
          Lifetime updates.
        </h2>
        <AvatarStack count={5} label="Trusted by 30+ engineers" />
      </div>

      <div className="mt-64 grid grid-cols-1 gap-24 lg:grid-cols-2">
        {EDITIONS.map((edition) => (
          <EditionCard key={edition.id} edition={edition} />
        ))}
      </div>

      <div className="mt-24 rounded-8 bg-black px-28 py-32 lg:px-32 lg:py-40">
        <p className="font-mono text-caption-20 uppercase tracking-wide text-white/35">
          Every edition includes
        </p>
        {/*
         * One list, split into two columns by the browser, so the numbering
         * stays a single sequence across the break.
         */}
        <ul className="mt-24 lg:columns-2 lg:gap-x-64">
          {INCLUDED.map((item, i) => (
            <NumberedRow key={item} index={i}>
              {item}
            </NumberedRow>
          ))}
        </ul>
      </div>
    </section>
  );
}
