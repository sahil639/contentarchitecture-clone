import Link from "next/link";
import { OdometerText } from "@/components/motion/odometer-text";
import { Connector } from "@/components/ui/connector";

/*
 * Split button.
 *
 * Two odometer segments joined by a connector, with an optional pinging status
 * dot. Splitting the label restarts the odometer stagger on the second half,
 * so both words begin rolling at once instead of the second trailing the first.
 *
 * The parent <a> owns --odometer-progress, so one hover drives every character.
 */
export function SplitButton({
  href,
  leading,
  trailing,
  ping = false,
  tone = "dark",
}: {
  href: string;
  leading: string;
  trailing: string;
  /** Accent dot in the top-right corner. */
  ping?: boolean;
  /** "dark" for light backgrounds, "light" for dark ones. */
  tone?: "dark" | "light";
}) {
  const skin =
    tone === "dark"
      ? "*:data-text:bg-black *:data-text:text-white *:data-connector:text-black"
      : "*:data-text:bg-ghost-grey *:data-text:text-black *:data-connector:text-ghost-grey";

  return (
    <Link
      href={href}
      className={[
        "relative inline-flex w-fit min-w-0 shrink-0 cursor-pointer items-center justify-center",
        "whitespace-nowrap font-mono text-body-10 uppercase",
        "[--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]",
        "*:data-text:inline-flex *:data-text:h-48 *:data-text:items-center",
        "*:data-text:rounded-8 *:data-text:px-20 lg:*:data-text:px-24",
        skin,
      ].join(" ")}
    >
      <span data-text="true">
        <OdometerText>{leading}</OdometerText>
      </span>
      <Connector orientation="vertical" length={26} />
      <span data-text="true">
        <OdometerText>{trailing}</OdometerText>
      </span>
      {ping && (
        <span aria-hidden="true" className="absolute top-8 right-8 flex size-6">
          <span className="absolute inline-flex size-6 animate-status-ping rounded-full bg-accent motion-reduce:hidden" />
          <span className="relative inline-flex size-6 rounded-full bg-accent" />
        </span>
      )}
    </Link>
  );
}
