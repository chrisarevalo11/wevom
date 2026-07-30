"use client";

import { FixedHeroBodyLayer } from "@/components/three/fixed-hero-body-layer";

export function LandingPageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FixedHeroBodyLayer />
      <div className="relative z-10">{children}</div>
    </>
  );
}
