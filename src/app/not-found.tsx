import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BodySceneCanvas } from "@/components/three/body-scene-canvas";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/*
       * The body itself, blurred back — the same treatment the menu overlay gives it, so the
       * copy stays legible on top. Softer here (blur-md) to sell the "left the body" idea.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60 blur-md"
      >
        <div className="h-full w-full max-w-md sm:max-w-xl">
          <BodySceneCanvas
            variant="hero"
            enableStretch={false}
            enableFloat
            showGradient={false}
            className="touch-none"
          />
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-10">
        <h1 className="max-w-md font-sans text-base leading-relaxed uppercase tracking-[0.16em] text-text sm:text-lg">
          {t("title")}
        </h1>

        <Link
          href="/"
          className="font-sans text-xs uppercase tracking-[0.28em] text-text-muted transition hover:text-text"
        >
          {/* Same dot treatment as the showcase and footer links */}
          <span aria-hidden>·&nbsp;</span>
          {t("backHome")}
          <span aria-hidden>&nbsp;·</span>
        </Link>
      </div>
    </div>
  );
}
