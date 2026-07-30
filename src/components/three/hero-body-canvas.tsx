"use client";

import { BodySceneCanvas } from "@/components/three/body-scene-canvas";

export function HeroBodyCanvas() {
  return (
    <BodySceneCanvas
      variant="hero"
      enableStretch
      enableFloat
      className="pointer-events-none touch-none"
    />
  );
}
