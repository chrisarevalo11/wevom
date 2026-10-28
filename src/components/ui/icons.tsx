import type { SVGProps } from "react";

/*
 * Inline icons, drawn once here rather than pulled from a library — the site needs very few,
 * and inline SVG inherits `currentColor` so it follows the text-link hover states for free.
 * Stroke-based at 1.5 to sit with the thin typographic buttons around it.
 */

type IconProps = SVGProps<SVGSVGElement>;

export function TrashIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  );
}
