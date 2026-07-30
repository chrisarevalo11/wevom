"use client";

import { BodySceneCanvas } from "@/components/three/body-scene-canvas";

/**
 * Stands in for the fixed hero layer on pages that don't have one. It deliberately uses
 * the "hero" variant: the "footer" variant frames the model with a closer camera and a
 * narrower fov, which renders it noticeably larger than the body on the home page.
 */
export function FooterBodyCanvas() {
  return (
    <BodySceneCanvas
      variant="hero"
      enableStretch={false}
      enableFloat={false}
      className="pointer-events-none touch-none"
    />
  );
}
