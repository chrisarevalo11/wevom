import { create } from "zustand";

type PageChromeState = {
  /** True while a page that ends on its own (the 404) is mounted, so the footer stays out */
  footerHidden: boolean;
  setFooterHidden: (hidden: boolean) => void;
};

export const usePageChromeStore = create<PageChromeState>((set) => ({
  footerHidden: false,
  setFooterHidden: (hidden) => set({ footerHidden: hidden }),
}));
