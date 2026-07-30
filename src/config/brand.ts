/** Logo letter config — first letter is a horizontally flipped "E" (reads as reversed E) */
export const LOGO_LETTERS = [
  { id: "e", char: "E", flipX: true },
  { id: "v", char: "V" },
  { id: "o", char: "O" },
  { id: "m", char: "M" },
] as const;

export type LogoLetter = (typeof LOGO_LETTERS)[number];

export const LOGO_WORDMARK = {
  loader: { fontSize: 30, gap: 10, letterWidth: 20, letterHeight: 30 },
  nav: { fontSize: 18, gap: 6, letterWidth: 12, letterHeight: 18 },
} as const;

export const APP_BACKGROUND = "#FAFAF5";

/** Accessible / metadata brand name (visual wordmark uses flipped E) */
export const BRAND_NAME = "EVOM";
