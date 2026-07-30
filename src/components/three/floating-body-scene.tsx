"use client";

import { ContactShadows, Environment, Float } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useReducedMotion3d } from "@/lib/three/use-reduced-motion-3d";
import { BodyModel } from "./body-model";
import { PlaceholderBody } from "./placeholder-body";

type FloatingBodySceneProps = {
  variant?: "hero" | "footer";
  enableStretch?: boolean;
  enableFloat?: boolean;
};

export function FloatingBodyScene({
  variant = "hero",
  enableStretch = false,
  enableFloat = true,
}: FloatingBodySceneProps) {
  const reducedMotion = useReducedMotion3d();
  const isFooter = variant === "footer";
  const shouldFloat = enableFloat && !reducedMotion;

  const model = <BodyModel enableStretch={enableStretch} />;

  return (
    <Canvas
      camera={{
        position: isFooter ? [0, 0.1, 3.4] : [0, 0.15, 4.2],
        fov: isFooter ? 38 : 42,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      className="h-full w-full touch-none"
    >
      <ambientLight intensity={0.55} />
      <directionalLight castShadow intensity={1.1} position={[4, 8, 4]} />
      <spotLight intensity={0.35} angle={0.4} penumbra={1} position={[-4, 6, 2]} />

      <Suspense fallback={<PlaceholderBody />}>
        {shouldFloat ? (
          <Float
            speed={1.4}
            rotationIntensity={0.12}
            floatIntensity={0.55}
            floatingRange={[-0.08, 0.08]}
          >
            {model}
          </Float>
        ) : (
          model
        )}

        <ContactShadows
          blur={2.8}
          opacity={0.28}
          position={[0, -1.35, 0]}
          scale={9}
          far={4}
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
