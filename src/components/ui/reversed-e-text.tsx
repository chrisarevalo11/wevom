import { Fragment } from "react";

/**
 * Marks a reversed E in copy. Rendered the way the navbar wordmark does it — a real "E"
 * mirrored in CSS rather than the Ǝ glyph — so it matches the brand mark in any font and
 * still reads as an "E" to screen readers.
 */
export const REVERSED_E = "Ǝ";

export function ReversedEText({ text }: { text: string }) {
  const segments = text.split(REVERSED_E);

  return segments.map((segment, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static copy, never reordered
    <Fragment key={index}>
      {index > 0 ? <span className="inline-block -scale-x-100">E</span> : null}
      {segment}
    </Fragment>
  ));
}
