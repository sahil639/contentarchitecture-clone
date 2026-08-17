/*
 * Connector.
 *
 * The short notched bracket that joins two halves of a split button, so the
 * pair reads as one object with a pinched waist. Built from three divs rather
 * than an SVG: two 4px caps carrying the concave notch as a clip-path, and a
 * flexible middle bar that stretches to fill.
 *
 * Colour comes from `currentColor`, so the parent sets it with a
 * `*:data-connector:text-…` utility.
 */

/* Notch geometry, from the reference. The caps are 6x4 in vertical form. */
const VERTICAL_TOP = 'path("M0 0H1C1 1.1046 1.8954 2 3 2C4.1046 2 5 1.1046 5 0H6V4H0Z")';
const VERTICAL_BOTTOM = 'path("M0 0H6V4H5C5 2.8954 4.1046 2 3 2C1.8954 2 1 2.8954 1 4H0Z")';
const HORIZONTAL_START = 'path("M0 0H4V6H0V5C1.1046 5 2 4.1046 2 3C2 1.8954 1.1046 1 0 1Z")';
const HORIZONTAL_END = 'path("M0 0H4V1C2.8954 1 2 1.8954 2 3C2 4.1046 2.8954 5 4 5V6H0Z")';

export function Connector({
  orientation = "vertical",
  length = 26,
}: {
  orientation?: "vertical" | "horizontal";
  /** Distance spanned between the two segments, in px. */
  length?: number;
}) {
  if (orientation === "horizontal") {
    return (
      <div
        aria-hidden="true"
        data-connector="true"
        className="-my-px flex h-6 flex-row"
        style={{ width: length }}
      >
        <div
          className="h-full w-4 shrink-0 bg-current"
          style={{ clipPath: HORIZONTAL_START }}
        />
        <div className="-mx-px h-full grow bg-current" />
        <div
          className="h-full w-4 shrink-0 bg-current"
          style={{ clipPath: HORIZONTAL_END }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      data-connector="true"
      className="-mx-px flex w-6 flex-col"
      style={{ height: length }}
    >
      <div
        className="h-4 w-full shrink-0 bg-current"
        style={{ clipPath: VERTICAL_TOP }}
      />
      <div className="-my-px w-full grow bg-current" />
      <div
        className="h-4 w-full shrink-0 bg-current"
        style={{ clipPath: VERTICAL_BOTTOM }}
      />
    </div>
  );
}
