import { create } from "zustand";

/**
 * The storefront is not selling yet: anything that would start a purchase — a product card,
 * the cart in the navbar — opens the "coming soon" modal instead of navigating. One store so
 * every entry point shares a single dialog instance mounted in the root layout.
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
