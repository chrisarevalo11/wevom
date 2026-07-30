"use client";

import dynamic from "next/dynamic";
import { SceneFallback } from "@/components/three/scene-fallback";
import { cn } from "@/lib/utils/cn";

const FloatingBodyScene = dynamic(
  () =>
    import("@/components/three/floating-body-scene").then(
      (mod) => mod.FloatingBodyScene,
    ),
  {
    ssr: false,
    loading: () => <SceneFallback />,
  },
);

type BodySceneCanvasProps = {
  className?: string;
  showGradient?: boolean;
  variant?: "hero" | "footer";
  enableStretch?: boolean;
  enableFloat?: boolean;
};

export function BodySceneCanvas({
  className,
  showGradient = true,
  variant = "hero",
  enableStretch = false,
  enableFloat = true,
}: BodySceneCanvasProps) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <FloatingBodyScene
        variant={variant}
        enableStretch={enableStretch}
        enableFloat={enableFloat}
      />
      {showGradient ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-b from-surface/0 to-surface"
        />
      ) : null}
    </div>
  );
}
