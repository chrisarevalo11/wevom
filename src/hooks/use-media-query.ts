"use client";

import { useEffect, useState } from "react";

/**
 * Always false on the server and on the first client render, so the markup matches and
 * hydration is clean; the real answer arrives in the effect straight after.
 *
 * For anything that can be expressed in CSS, use a Tailwind breakpoint instead. This is for
 * the cases where the breakpoint decides what gets *mounted* — a hidden element still runs its
 * effects, and a hidden WebGL canvas still builds a scene.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const apply = () => setMatches(media.matches);

    apply();
    media.addEventListener("change", apply);

    return () => media.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

/** The lg breakpoint, which is where the catalog switches to its horizontal layout */
export const DESKTOP_QUERY = "(min-width: 1024px)";
