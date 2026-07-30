import { create } from "zustand";

type CartUiState = {
  isOpen: boolean;
  optimisticCount: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOptimisticCount: (count: number) => void;
};

export const useCartUiStore = create<CartUiState>((set) => ({
  isOpen: false,
  optimisticCount: 0,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOptimisticCount: (count) => set({ optimisticCount: count }),
}));
