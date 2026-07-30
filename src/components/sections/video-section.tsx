"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

// TODO: replace with the final brand video asset (drop the file in /public/videos)
// TODO: add a poster frame (a small webp/jpg still) — it paints instantly and hides the load
const VIDEO_SRC = "/videos/brand-video.mp4";
const VIDEO_POSTER: string | undefined = undefined;

/** How early the video file starts downloading, ahead of entering the viewport */
const PRELOAD_MARGIN = "600px";

/** Scroll distance the six lines reveal over */
const LINES_SCROLL_VH = 240;

/**
 * Extra pinned scroll after the last line: breathing room, then the about image slides
 * across. Keep the overlap portion in sync with OVERLAP in about-image-section.tsx.
 */
const VIDEO_TAIL_VH = 140;

/** Distance from the top while pinned — clears the 64px navbar with breathing room */

const LINES = [
  "Crafted with intention.",
  "Designed to last.",
  "Every stitch answers to the same standard.",
  "Quality that goes beyond the surface.",
  "No shortcuts, no compromises.",
  "Made for the people who notice the difference.",
] as const;

export function VideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Nothing downloads until the section is nearly in view, so it costs the initial load nothing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Muted autoplay is the only kind browsers allow without a user gesture
          video.play().catch(() => {});
        } else {
          // Pausing offscreen keeps decode off the main thread while the page scrolls
          video.pause();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [shouldLoad]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const lines = gsap.utils.toArray<HTMLElement>("[data-video-line]", section);
      const frame = section.querySelector("[data-video-frame]");
      if (lines.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(lines, { autoAlpha: 1, y: 0 });
        if (frame) gsap.set(frame, { autoAlpha: 1 });
        return;
      }

      if (frame) {
        gsap.fromTo(
          frame,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              // Triggers off the section, not the frame — the frame is sticky, and
              // ScrollTrigger mismeasures elements whose position shifts while stuck
              trigger: section,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      gsap.set(lines, { autoAlpha: 0, y: 28 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: `top 0px`,
          // A fixed distance rather than the section bottom: the tail below exists for the
          // about image to slide over, and must not stretch the reveal along with it
          end: () => `+=${window.innerHeight * (LINES_SCROLL_VH / 100)}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      lines.forEach((line, index) => {
        timeline.to(line, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" });
        if (index < lines.length - 1) {
          timeline.to({}, { duration: 0.35 });
        }
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-surface pt-20">
      <div
        className="flex flex-col items-center"
        style={{ position: "sticky", top: 0 }}
      >
        <div
          data-video-frame
          className="relative aspect-video max-h-[40vh] w-full overflow-hidden bg-surface-muted"
        >
          <video
            ref={videoRef}
            src={shouldLoad ? VIDEO_SRC : undefined}
            poster={VIDEO_POSTER}
            title="Brand video"
            controls
            muted
            loop
            playsInline
            disableRemotePlayback
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-4 px-3 sm:px-6 lg:px-8">
          {LINES.map((line) => (
            <p
              key={line}
              data-video-line
              className="text-center text-sm leading-relaxed text-text-muted sm:text-base"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Scroll runway that keeps the block pinned while the lines reveal, then through the tail */}
      <div style={{ height: `${LINES_SCROLL_VH + VIDEO_TAIL_VH}vh` }} aria-hidden />
    </section>
  );
}
