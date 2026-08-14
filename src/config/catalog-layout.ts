/**
 * The disorder is authored, not random. A runtime `Math.random()` would differ between the
 * server and client render (hydration mismatch) and reshuffle on every navigation, so the
 * scatter is a fixed pattern of slots applied by `index % CATALOG_SLOTS.length` — as many
 * products as the catalog holds, cycling through the same deliberate composition.
 *
 * Twelve slots over six grid rows, so a 20-product catalog gets through most of the sequence
 * before anything repeats. Intentionally a different composition from the home showcase: it
 * opens wide on the left, drops two per row at uneven heights, and mixes wider aspect ratios.
 *
 * Nothing here overlaps. Offsets are positive only — a negative margin would pull a card over
 * its neighbour's image — and the grid's own row gap plus these offsets stay clear of the
 * parallax travel below, which is capped well under the gap.
 */
/** Rows one cycle of slots occupies — every repeat is pushed down by this many */
export const ROWS_PER_CYCLE = 6;

export type CatalogSlot = {
  /** Width and cross-axis alignment in the mobile column */
  mobile: string;
  /**
   * Column placement plus vertical offset from md up. Each entry also resets the mobile width
   * and alignment (md:w-full, md:self-auto) — those have no breakpoint of their own and would
   * otherwise shrink the card to a fraction of its grid column on desktop.
   */
  desktop: string;
  /**
   * Grid row within one cycle. Deliberately not a `md:row-start-*` class: a 20-product catalog
   * runs through the slots more than once, and a hard-coded row would drop item 13 straight on
   * top of item 1. The layout offsets this by cycle instead.
   */
  row: number;
  aspect: string;
  /**
   * Parallax travel in px across the card's trip through the viewport. Mixed signs are what
   * break the grid feel — neighbouring cards drift against each other. Keep magnitudes below
   * half the row gap so drifting cards never close the space between rows.
   */
  drift: number;
};

const DESKTOP_RESET = "md:w-full md:self-auto";

export const CATALOG_SLOTS: CatalogSlot[] = [
  {
    mobile: "w-[78%] self-start",
    desktop: `md:col-span-5 md:col-start-1 ${DESKTOP_RESET}`,
    row: 1,
    aspect: "aspect-[3/4]",
    drift: -30,
  },
  {
    mobile: "w-[48%] self-end mt-16",
    desktop: `md:col-span-4 md:col-start-8 md:mt-32 ${DESKTOP_RESET}`,
    row: 1,
    aspect: "aspect-square",
    drift: 24,
  },
  {
    mobile: "w-[42%] self-start mt-20",
    desktop: `md:col-span-3 md:col-start-2 md:mt-10 ${DESKTOP_RESET}`,
    row: 2,
    aspect: "aspect-[2/3]",
    drift: 34,
  },
  {
    mobile: "w-[90%] self-center mt-14",
    desktop: `md:col-span-6 md:col-start-6 md:mt-28 ${DESKTOP_RESET}`,
    row: 2,
    aspect: "aspect-[16/10]",
    drift: -22,
  },
  {
    mobile: "w-[64%] self-start mt-16",
    desktop: `md:col-span-4 md:col-start-1 md:mt-6 ${DESKTOP_RESET}`,
    row: 3,
    aspect: "aspect-[4/5]",
    drift: 28,
  },
  {
    mobile: "w-[56%] self-end mt-12",
    desktop: `md:col-span-5 md:col-start-7 md:mt-24 ${DESKTOP_RESET}`,
    row: 3,
    aspect: "aspect-[5/4]",
    drift: -34,
  },
  {
    mobile: "w-[72%] self-end mt-20",
    desktop: `md:col-span-5 md:col-start-3 md:mt-12 ${DESKTOP_RESET}`,
    row: 4,
    aspect: "aspect-[3/4]",
    drift: -26,
  },
  {
    mobile: "w-[46%] self-start mt-14",
    desktop: `md:col-span-4 md:col-start-9 md:mt-36 ${DESKTOP_RESET}`,
    row: 4,
    aspect: "aspect-square",
    drift: 30,
  },
  {
    mobile: "w-[52%] self-end mt-16",
    desktop: `md:col-span-3 md:col-start-1 md:mt-8 ${DESKTOP_RESET}`,
    row: 5,
    aspect: "aspect-[2/3]",
    drift: 20,
  },
  {
    mobile: "w-[68%] self-start mt-20",
    desktop: `md:col-span-4 md:col-start-5 md:mt-28 ${DESKTOP_RESET}`,
    row: 5,
    aspect: "aspect-[4/5]",
    drift: -30,
  },
  {
    mobile: "w-[86%] self-center mt-16",
    desktop: `md:col-span-4 md:col-start-2 md:mt-4 ${DESKTOP_RESET}`,
    row: 6,
    aspect: "aspect-[5/4]",
    drift: 32,
  },
  {
    mobile: "w-[58%] self-end mt-14",
    desktop: `md:col-span-5 md:col-start-8 md:mt-20 ${DESKTOP_RESET}`,
    row: 6,
    aspect: "aspect-[3/4]",
    drift: -24,
  },
];
