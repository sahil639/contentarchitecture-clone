/*
 * Avatar stack.
 *
 * Overlapping circles for the social-proof row. Each sits above the one to its
 * right so the stack reads left-to-right, and carries a ring in the page colour
 * to separate it from its neighbour.
 *
 * Placeholder discs for now, to be swapped for real portraits.
 */

const OVERLAP = "-ml-10";

export function AvatarStack({
  count = 5,
  label,
}: {
  count?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-12">
      <div className="flex items-center">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`size-28 shrink-0 rounded-full bg-dark-grey ring-2 ring-off-white ${i === 0 ? "" : OVERLAP}`}
            /* Later discs sit under earlier ones, so the row reads left to right. */
            style={{ zIndex: count - i }}
          />
        ))}
      </div>
      <span className="font-mono text-caption-10 uppercase tracking-wide text-black">
        {label}
      </span>
    </div>
  );
}
