import { Inter, Source_Code_Pro } from "next/font/google";

/** Main UI font — applied globally via `font-sans` */
export const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-main",
  display: "swap",
});

/** EVOM wordmark — Inter (flipped E + VOM) */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-wordmark-family",
  display: "swap",
  weight: ["400", "500"],
});

export const fontVariables = `${sourceCodePro.variable} ${inter.variable}`;
