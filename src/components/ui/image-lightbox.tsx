"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

/** How far a click into the image blows it up */
const ZOOM_SCALE = 2.4;

type ImageLightboxProps = {
  src: string;
  alt: string;
  closeLabel: string;
  onClose: () => void;
};

/**
 * A single image lifted out of the page: the backdrop dims what is behind it, a click on the
 * image zooms into the exact point that was clicked, and a click anywhere off the image —
 * or Escape — closes it.
 */
export function ImageLightbox({ src, alt, closeLabel, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    // The page behind must not scroll under the overlay
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const toggleZoom = (event: React.MouseEvent<HTMLElement>) => {
    if (zoom) {
      setZoom(null);
      return;
    }

    // The clicked point becomes the transform origin, so the image grows around whatever
    // detail the pointer was on rather than around its centre
    const bounds = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  return createPortal(
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is bound above and the close button is keyboard reachable
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-surface/90 p-4 sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 font-sans text-xs uppercase tracking-[0.24em] text-text transition hover:opacity-60 sm:right-8 sm:top-8"
      >
        {closeLabel}
      </button>

      <button
        type="button"
        aria-label={alt}
        onClick={(event) => {
          // Without this the backdrop's close fires on every click into the image
          event.stopPropagation();
          toggleZoom(event);
        }}
        className={cn(
          "relative block max-h-full overflow-hidden",
          zoom ? "cursor-zoom-out" : "cursor-zoom-in",
        )}
      >
        <Image
          src={src}
          alt=""
          width={1400}
          height={1750}
          priority
          className="h-auto max-h-[86vh] w-auto object-contain transition-transform duration-500 ease-out"
          style={
            zoom
              ? {
                  transform: `scale(${ZOOM_SCALE})`,
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                }
              : undefined
          }
        />
      </button>
    </div>,
    document.body,
  );
}
