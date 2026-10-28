/**
 * The disorder is authored, not random. A runtime `Math.random()` would differ between the
 * server and client render (hydration mismatch) and reshuffle on every navigation, so the
 * scatter is a fixed pattern of slots applied by `index % CATALOG_SLOTS.length` — as many
 * products as the catalog holds, cycling through the same deliberate composition.
 *
 * The composition is built to read as a scatter, not as a grid:
 *
 * - card counts per row vary (three, two, or a single card left alone with the width around
 *   it), so no eye can lock onto a repeating pair;
 * - widths run from two columns to seven, and the aspect ratios with them, so neighbouring
 *   cards are never the same size;
 * - the vertical offsets are large and unrelated to each other — up to fourteen rem — so two
 *   cards sharing a grid row almost never share a top edge. The grid row is bookkeeping that
 *   guarantees nothing overlaps; it is not a line you can see.
 *
 * The row gap is deliberately small: nearly all the vertical rhythm comes from those offsets.
 *
 * Nothing here overlaps. Every row keeps at least one empty column between its cards, and
 * offsets are positive only — a negative margin would pull a card over its neighbour's image.
 */
/**
 * The space either side of the filter rail. Two tokens rather than one because the gaps are
 * written by different elements — keep them in step. The top is 10px tighter than the bottom
 * on purpose: the header's own box already contributes part of that gap, so matching the two
 * numbers exactly reads as too much air above the rail.
 */
export const RAIL_SPACE_ABOVE = "pt-[86px] md:pt-[102px]";
export const RAIL_SPACE_BELOW = "mt-24 md:mt-28";

/** Rows one cycle of slots occupies — every repeat is pushed down by this many */
export const ROWS_PER_CYCLE = 8;

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
   * runs through the slots more than once, and a hard-coded row would drop item 17 straight on
   * top of item 1. The layout offsets this by cycle instead.
   */
  row: number;
  aspect: string;
};

const DESKTOP_RESET = "md:w-full md:self-auto";

export const CATALOG_SLOTS: CatalogSlot[] = [
  // A wide opener against a small square dropped most of a screen lower
  {
    mobile: "w-[84%] self-start",
    desktop: `md:col-span-5 md:col-start-1 ${DESKTOP_RESET}`,
    row: 1,
    aspect: "aspect-[3/4]",
  },
  {
    mobile: "w-[42%] self-end mt-24",
    desktop: `md:col-span-4 md:col-start-9 md:mt-56 ${DESKTOP_RESET}`,
    row: 1,
    aspect: "aspect-square",
  },
  // A narrow portrait beside a panorama that runs off the right edge
  {
    mobile: "w-[38%] self-start mt-14",
    desktop: `md:col-span-3 md:col-start-2 md:mt-16 ${DESKTOP_RESET}`,
    row: 2,
    aspect: "aspect-[2/3]",
  },
  {
    mobile: "w-[96%] self-center mt-20",
    desktop: `md:col-span-7 md:col-start-6 md:mt-64 ${DESKTOP_RESET}`,
    row: 2,
    aspect: "aspect-[16/10]",
  },
  // Three across at three different heights — the busiest band
  {
    mobile: "w-[66%] self-start mt-16",
    desktop: `md:col-span-4 md:col-start-1 ${DESKTOP_RESET}`,
    row: 3,
    aspect: "aspect-[4/5]",
  },
  {
    mobile: "w-[30%] self-center mt-10",
    desktop: `md:col-span-2 md:col-start-6 md:mt-36 ${DESKTOP_RESET}`,
    row: 3,
    aspect: "aspect-square",
  },
  {
    mobile: "w-[54%] self-end mt-12",
    desktop: `md:col-span-4 md:col-start-9 md:mt-12 ${DESKTOP_RESET}`,
    row: 3,
    aspect: "aspect-[3/4]",
  },
  // One card alone, off-centre, with the width left open around it
  {
    mobile: "w-[88%] self-center mt-20",
    desktop: `md:col-span-6 md:col-start-3 md:mt-28 ${DESKTOP_RESET}`,
    row: 4,
    aspect: "aspect-[5/4]",
  },
  // Three again, this time small-large-small
  {
    mobile: "w-[46%] self-start mt-16",
    desktop: `md:col-span-3 md:col-start-1 md:mt-8 ${DESKTOP_RESET}`,
    row: 5,
    aspect: "aspect-[3/4]",
  },
  {
    mobile: "w-[34%] self-end mt-12",
    desktop: `md:col-span-3 md:col-start-5 md:mt-48 ${DESKTOP_RESET}`,
    row: 5,
    aspect: "aspect-square",
  },
  {
    mobile: "w-[60%] self-start mt-14",
    desktop: `md:col-span-4 md:col-start-9 ${DESKTOP_RESET}`,
    row: 5,
    aspect: "aspect-[2/3]",
  },
  // A panorama spanning almost the whole width
  {
    mobile: "w-full mt-20",
    desktop: `md:col-span-7 md:col-start-2 md:mt-32 ${DESKTOP_RESET}`,
    row: 6,
    aspect: "aspect-[16/9]",
  },
  // The smallest card on the page against two much larger ones
  {
    mobile: "w-[28%] self-start mt-16",
    desktop: `md:col-span-2 md:col-start-1 md:mt-20 ${DESKTOP_RESET}`,
    row: 7,
    aspect: "aspect-square",
  },
  {
    mobile: "w-[70%] self-end mt-12",
    desktop: `md:col-span-4 md:col-start-4 md:mt-56 ${DESKTOP_RESET}`,
    row: 7,
    aspect: "aspect-[4/5]",
  },
  {
    mobile: "w-[52%] self-start mt-16",
    desktop: `md:col-span-4 md:col-start-9 md:mt-4 ${DESKTOP_RESET}`,
    row: 7,
    aspect: "aspect-[5/4]",
  },
  // Closes on a tall block pushed to the right half
  {
    mobile: "w-[80%] self-end mt-20",
    desktop: `md:col-span-6 md:col-start-6 md:mt-40 ${DESKTOP_RESET}`,
    row: 8,
    aspect: "aspect-[3/4]",
  },
];

/**
 * The desktop rail: the same authored scatter turned on its side.
 *
 * Cards sit on a track that scrolls sideways, so the rhythm is the mirror of the stacked
 * layout above — the gap before each card is the irregular horizontal spacing, and `shift` is
 * how far down the track it hangs. Sizes run from a sixth of the viewport to nearly a third,
 * and the shifts are chosen against the card's own height so a short card hangs low and a tall
 * one sits high: nothing reaches the bottom of the screen, and no two neighbours line up.
 *
 * The full height of the screen is in play: some cards start above the top edge and are cut by
 * it, others are anchored to the bottom and sit a few vh off it. They pass behind the navbar
 * and behind the category column, both of which blend against whatever is behind them — that
 * crossing is the effect, not a collision to design around.
 *
 * The bottom offsets are all different (2vh to 16vh) on purpose: a row of cards all touching
 * the bottom edge would be as much of a line as a row all floating above it.
 *
 * Widths are in vw and shifts in vh on purpose — the track is exactly one screen tall, and
 * both have to hold their proportions on any monitor. The max-height beside each aspect ratio
 * is the backstop for the one case vw units get wrong: a wide, short monitor, where a portrait
 * card sized off the width would stand taller than the screen it has to fit on. Past the cap
 * the ratio gives way and the image crops, which is what object-cover is there for.
 */
export type CatalogRailSlot = {
  /** Card width across the viewport */
  width: string;
  /**
   * Space before the card — this is the irregular part. Every slot needs one, including the
   * first: the sequence cycles, so slot one's gap is what separates the last card of one pass
   * from the first card of the next. On the opening card it simply adds to the track's lead.
   */
  gap: string;
  /**
   * Which edge of the track the card hangs from, and how far off it.
   *
   * Anchoring matters more than the number: a card measured from the top floats at a height
   * that depends on how tall it happens to be, which on a short screen leaves the whole bottom
   * of the rail empty. The ones anchored to the bottom sit a known distance from it whatever
   * their size, and that is what stops the empty strip along the bottom edge from reading as a
   * margin. Roughly half the slots hang from each edge; a negative top offset runs the card
   * off the top, behind the navbar, which is what the navbar's blend mode is for.
   */
  place: string;
  aspect: string;
};

export const CATALOG_RAIL_SLOTS: CatalogRailSlot[] = [
  {
    width: "w-[26vw]",
    gap: "ml-[8vw]",
    place: "self-start -mt-[12vh]",
    aspect: "max-h-[86vh] aspect-[3/4]",
  },
  {
    width: "w-[15vw]",
    gap: "ml-[7vw]",
    place: "self-end mb-[3vh]",
    aspect: "max-h-[40vh] aspect-square",
  },
  {
    width: "w-[20vw]",
    gap: "ml-[4vw]",
    place: "self-start mt-[8vh]",
    aspect: "max-h-[72vh] aspect-[2/3]",
  },
  {
    width: "w-[30vw]",
    gap: "ml-[11vw]",
    place: "self-end mb-[12vh]",
    aspect: "max-h-[56vh] aspect-[16/10]",
  },
  {
    width: "w-[18vw]",
    gap: "ml-[5vw]",
    place: "self-start -mt-[6vh]",
    aspect: "max-h-[72vh] aspect-[4/5]",
  },
  {
    width: "w-[24vw]",
    gap: "ml-[9vw]",
    place: "self-end mb-[2vh]",
    aspect: "max-h-[62vh] aspect-[5/4]",
  },
  {
    width: "w-[16vw]",
    gap: "ml-[4vw]",
    place: "self-center mt-[4vh]",
    aspect: "max-h-[64vh] aspect-[3/4]",
  },
  {
    width: "w-[22vw]",
    gap: "ml-[12vw]",
    place: "self-end mb-[16vh]",
    aspect: "max-h-[54vh] aspect-square",
  },
  {
    width: "w-[28vw]",
    gap: "ml-[6vw]",
    place: "self-start -mt-[2vh]",
    aspect: "max-h-[58vh] aspect-[16/9]",
  },
  {
    width: "w-[15vw]",
    gap: "ml-[4vw]",
    place: "self-end mb-[6vh]",
    aspect: "max-h-[62vh] aspect-[2/3]",
  },
  {
    width: "w-[21vw]",
    gap: "ml-[10vw]",
    place: "self-start mt-[12vh]",
    aspect: "max-h-[70vh] aspect-[4/5]",
  },
  {
    width: "w-[25vw]",
    gap: "ml-[5vw]",
    place: "self-end mb-[9vh]",
    aspect: "max-h-[60vh] aspect-[5/4]",
  },
];

/**
 * Open space above the rail, before it tops out and pins. It buys a stretch of ordinary
 * vertical scrolling after the navbar, so the page does not turn sideways the instant it
 * loads — the hand-off into the horizontal scroll is something you arrive at.
 */
export const RAIL_LEAD_IN = "mt-[18vh]";

/**
 * Clears the pinned category column, so the first card does not start underneath it. The
 * opening card's own gap adds to this — the two together are the real lead.
 */
export const RAIL_TRACK_LEAD = "pl-[18vw] xl:pl-[14vw]";

/** Cancels `RAIL_TRACK_LEAD` for a child that should span the viewport (the empty state) */
export const RAIL_TRACK_LEAD_UNDO = "-ml-[18vw] xl:-ml-[14vw]";

/** Air between the last card and whatever ends the track */
export const RAIL_TRACK_TAIL = "ml-[14vw]";

/*
 * ---------------------------------------------------------------------------------------------
 * Home showcase
 * ---------------------------------------------------------------------------------------------
 */

export type ShowcaseSlot = {
  aspect: string;
  /** Mobile: width, alignment, spacing */
  mobile: string;
  /** Desktop: grid column placement — rows are hard-coded, see below */
  desktop: string;
};

/**
 * The home showcase is a single authored composition rather than a cycle: each slot pins a
 * `md:row-start-*`, so it holds at most `SHOWCASE_SLOTS.length` products and the fetch is
 * capped to that. Eight slots over four rows, each row a different count and width.
 */
export const SHOWCASE_SLOTS: ShowcaseSlot[] = [
  {
    aspect: "aspect-[3/4]",
    mobile: "w-[88%] self-start",
    desktop: "md:col-span-5 md:col-start-1 md:row-start-1 md:translate-x-[100px]",
  },
  {
    aspect: "aspect-[4/5]",
    mobile: "w-[58%] self-end mt-10",
    desktop:
      "md:col-span-4 md:col-start-9 md:row-start-1 md:mt-28 md:translate-x-[100px]",
  },
  {
    aspect: "aspect-square",
    mobile: "w-[48%] self-start mt-16",
    desktop: "md:col-span-3 md:col-start-1 md:row-start-2 md:mt-[230px]",
  },
  {
    aspect: "aspect-[3/5]",
    mobile: "w-[64%] self-end mt-14",
    desktop: "md:col-span-5 md:col-start-8 md:row-start-2 md:mt-36",
  },
  {
    aspect: "aspect-square",
    mobile: "w-[44%] self-start mt-12",
    desktop: "md:col-span-3 md:col-start-2 md:row-start-3 md:mt-16",
  },
  {
    aspect: "aspect-[16/10]",
    mobile: "w-full mt-16",
    desktop: "md:col-span-6 md:col-start-7 md:row-start-3 md:mt-24",
  },
  {
    aspect: "aspect-[4/5]",
    mobile: "w-[52%] self-start mt-14",
    desktop: "md:col-span-4 md:col-start-2 md:row-start-4 md:mt-32",
  },
  {
    aspect: "aspect-[3/4]",
    mobile: "w-[72%] self-end mt-12",
    desktop:
      "md:col-span-4 md:col-start-8 md:row-start-4 md:mt-8 md:translate-x-[60px]",
  },
];
