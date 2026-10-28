import { create } from "zustand";

/** Viewport coordinates — the overlay that reads these is fixed, so they need no scroll offset */
export type TransitionRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type ProductTransition = {
  /** Where the click is headed. Only that page's hero answers the morph */
  href: string;
  /**
   * The exact URL the card's image is already showing — `currentSrc`, not the original file.
   * Taking the optimized source the browser has in cache is what lets the overlay paint on
   * the first frame instead of fetching the full-size image and flashing empty.
   */
  src: string;
  from: TransitionRect;
};

type ProductTransitionState = {
  pending: ProductTransition | null;
  start: (transition: ProductTransition) => void;
  clear: () => void;
};

/**
 * Hands a product card's image to the detail page it opens.
 *
 * The card writes where its image is on screen and then navigates; an overlay mounted in the
 * root layout — the only thing that survives the route change — picks the image up from there
 * and carries it to wherever the new page puts it.
 */
export const useProductTransitionStore = create<ProductTransitionState>((set) => ({
  pending: null,
  start: (transition) => set({ pending: transition }),
  clear: () => set({ pending: null }),
}));
