import { create } from "zustand";

/**
 * Browsing is real — the catalog links through to product pages, the navbar opens the cart —
 * but the placeholder products have no variants behind them, so the last step, adding one to
 * the cart, raises this instead. One store so every entry point shares a single dialog
 * instance mounted in the root layout.
 */
type ComingSoonState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useComingSoonStore = create<ComingSoonState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
