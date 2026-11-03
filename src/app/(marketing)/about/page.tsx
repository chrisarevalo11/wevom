import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutCascade, Fragment } from "@/components/sections/about-cascade";
import { MARKER_DOT_SLOT } from "@/components/ui/text-link";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.meta");

  return { title: t("title"), description: t("description") };
}

type ExplorationLine = { name: string; fragments: string[] };

/**
 * Where fragment `index` of `count` sits on the arc: 0 at the right edge, 1 at the furthest
 * point. The sweep stops short of a full half-turn, so the text swings out and comes most of
 * the way back without closing the loop.
 */
const ARC_SWEEP = 0.8 * Math.PI;

function arc(index: number, count: number): number {
  if (count < 2) return 0;
  return Math.sin((ARC_SWEEP * index) / (count - 1));
}

/**
 * Where fragment `index` of `count` sits on the second curve, which carries the first one on.
 * Both are the same wave. The first stops at 0.8π on the way down; the title row and its
 * spacing sit in between, so this one starts a little further along that same descent, as if
 * the curve had kept going through the gap, then swings in to the right edge, out to the far
 * left and settles there.
 */
const DRIFT_START = 1.8;
const DRIFT_END = 2 * Math.PI + 0.5;

function drift(index: number, count: number): number {
  if (count < 2) return 0.5;
  const theta = DRIFT_START + ((DRIFT_END - DRIFT_START) * index) / (count - 1);
  return 0.5 + 0.4 * Math.cos(theta);
}

/**
 * The brand's statement, typeset as movement: short fragments stepping down from the top
 * right corner to the bottom left, where the three lines of exploration gather like a byline.
 * The fragments and their breaks are part of the copy, so each language brings its own.
 */
export default async function AboutPage() {
  const t = await getTranslations("about");
  const fragments = t.raw("cascade") as string[];
  const lines = t.raw("lines.items") as ExplorationLine[];
  // The three lines run as one sequence: each name in bold, then its fragments
  const lineFragments = lines.flatMap((line) => [
    { text: line.name, title: true },
    ...line.fragments.map((text) => ({ text, title: false })),
  ]);
  const introIndex = fragments.length;

  return (
    <AboutCascade>
      <div className="w-full px-5 pt-28 pb-24 sm:px-8 lg:px-12 lg:pt-36">
        {/*
         * Each fragment hugs the right edge, then is pushed in from the right by its place on
         * an arc (--curve, 0 at both ends and 1 in the middle): the text swings out to the left
         * across the screen and comes back, with every line clear of the one before it. The
         * reach of the arc is set in the stylesheet, smaller on phones.
         */}
        <h1 className="about-stair font-sans text-sm leading-tight tracking-wide text-text sm:text-base lg:text-lg">
          {fragments.map((fragment, index) => (
            <Fragment
              // biome-ignore lint/suspicious/noArrayIndexKey: the fragments are a fixed, positional typesetting of the copy; a word can repeat
              key={index}
              index={index}
              curve={arc(index, fragments.length)}
              className="about-step block w-fit text-right"
            >
              {fragment}
            </Fragment>
          ))}
        </h1>

        {/*
         * The intro line spread across the middle of the screen: its words are pushed apart
         * to fill 80% of the width, so the sentence reads as a bar the three lines hang from.
         */}
        <Fragment
          index={introIndex}
          className="mx-auto mt-20 block w-4/5 font-sans text-xs uppercase tracking-[0.24em] text-text-muted lg:mt-28"
          innerClassName="flex flex-wrap justify-between gap-x-6 gap-y-1"
        >
          {t("lines.intro")
            .split(" ")
            .map((word, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed sentence; a word can repeat
              <span key={index}>{word}</span>
            ))}
        </Fragment>

        {/*
         * The three lines of exploration carry the curve on from where the statement left it:
         * the same stepping fragments, each name in bold with a dot, swinging on down the page.
         */}
        <div className="about-stair mt-12 font-sans text-sm leading-tight tracking-wide text-text sm:text-base lg:mt-16 lg:text-lg">
          {lineFragments.map((fragment, index) => (
            <Fragment
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed, positional typesetting of the copy; a word can repeat
              key={index}
              index={introIndex + 1 + index}
              curve={drift(index, lineFragments.length)}
              className={cn(
                "about-step block w-fit text-right",
                // A title opens its line in bold, with the site's marker dot after it, and a
                // breath of space above: the curve runs on through the gap, the text does not
                fragment.title && "mt-8 font-semibold lg:mt-12",
              )}
            >
              {fragment.text}
              {fragment.title && (
                <span aria-hidden className={cn(MARKER_DOT_SLOT, "text-right")}>
                  ·
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </AboutCascade>
  );
}
