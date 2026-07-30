"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { SceneFallback } from "@/components/three/scene-fallback";
import { useGSAP } from "@/lib/gsap";

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

  useGSAP(() => {
    // Keep fixed body visible throughout the page — no separate footer body needed.
  }, []);

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
