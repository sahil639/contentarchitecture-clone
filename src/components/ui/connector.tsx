/*
 * Connector.
 *
 * The short notched bracket that joins two halves of a split control, so the
 * pair reads as one object with a pinched waist. Colour comes from
 * `currentColor`, so the parent sets it with a `*:data-connector:text-…`
 * utility.
 *
 * Drawn as a single path rather than assembled from stacked divs: the notches
 * are carved from opposite ends of one shape, which makes them exact mirrors by
 * construction. Building it from three boxes left the two ends visibly
 * different once flex rounding and the overlap margins had been applied.
 *
 * The SVG is sized in user units matching CSS pixels, so the notch geometry
 * stays constant at any length instead of stretching with it.
 */

/* Notch reach across the bar, and how deep it bites in. */
const NOTCH_INSET = 1;
const NOTCH_DEPTH = 2;
/* Circular-arc control offset for a quarter turn. */
const K = 1.1046;

function verticalPath(span: number): string {
  const d = NOTCH_DEPTH;
  const i = NOTCH_INSET;
  return [
    `M0 0`,
    `H${i}`,
    `C${i} ${K} ${3 - K} ${d} 3 ${d}`,
    `C${3 + K} ${d} ${6 - i} ${K} ${6 - i} 0`,
    `H6`,
    `V${span}`,
    `H${6 - i}`,
    `C${6 - i} ${span - K} ${3 + K} ${span - d} 3 ${span - d}`,
    `C${3 - K} ${span - d} ${i} ${span - K} ${i} ${span}`,
    `H0`,
    `Z`,
  ].join(" ");
}

function horizontalPath(span: number): string {
  const d = NOTCH_DEPTH;
  const i = NOTCH_INSET;
  return [
    `M0 0`,
    `V${i}`,
    `C${K} ${i} ${d} ${3 - K} ${d} 3`,
    `C${d} ${3 + K} ${K} ${6 - i} 0 ${6 - i}`,
    `V6`,
    `H${span}`,
    `V${6 - i}`,
    `C${span - K} ${6 - i} ${span - d} ${3 + K} ${span - d} 3`,
    `C${span - d} ${3 - K} ${span - K} ${i} ${span} ${i}`,
    `V0`,
    `Z`,
  ].join(" ");
}

export function Connector({
  orientation = "vertical",
  length = 26,
}: {
  orientation?: "vertical" | "horizontal";
  /** Distance spanned between the two segments, in px. */
  length?: number;
}) {
  const vertical = orientation === "vertical";
  const width = vertical ? 6 : length;
  const height = vertical ? length : 6;

  return (
    <svg
      aria-hidden="true"
      data-connector="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      /* Negative margin closes the hairline against each neighbouring segment. */
      className={vertical ? "-mx-px shrink-0" : "-my-px shrink-0"}
      fill="currentColor"
    >
      <title>Connector</title>
      <path d={vertical ? verticalPath(length) : horizontalPath(length)} />
    </svg>
  );
}
