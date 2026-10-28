"use client";

import { useRef } from "react";
import { useHeroScrollFade } from "@/hooks/use-hero-scroll-fade";

/**
 * Wrapper that hands its children the hero's scroll-linked fade, on the earlier window the
 * sticky content needs. Exists so a Server Component (the hero) can opt content into it
 * without becoming a client module itself.
 */
export function HeroScrollFade({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useHeroScrollFade(ref, { fadeWindow: "sticky" });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
