"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { SceneFallback } from "@/components/three/scene-fallback";
import { useHeroScrollFade } from "@/hooks/use-hero-scroll-fade";

const BodySceneCanvas = dynamic(
  () =>
    import("@/components/three/body-scene-canvas").then((mod) => mod.BodySceneCanvas),
  {
    ssr: false,
    loading: () => <SceneFallback />,
  },
);

export function FixedHeroBodyLayer() {
  const layerRef = useRef<HTMLDivElement>(null);

  // Fades out on the hero's way out and back in at the footer, where this same instance is
  // the body the page ends on — no separate footer body needed.
  useHeroScrollFade(layerRef, { restoreOnFooter: true });

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-[2] flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="h-full w-full max-w-md sm:max-w-xl">
        <BodySceneCanvas enableStretch enableFloat variant="hero" />
      </div>
    </div>
  );
}
