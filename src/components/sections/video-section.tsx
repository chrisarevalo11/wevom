"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ReversedEText } from "@/components/ui/reversed-e-text";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Transcoded from the 273 MB master (public/video/FINAL1.mov, gitignored) with the commands
 * in public/video/README.md. Four renditions: AV1 where it's supported, H.264 everywhere
 * else, at 720p on phones and 1080p above.
 */
const SOURCES = [
  // AV1 first — roughly half the bytes of the H.264 fallback. The codecs string matters:
  // Safari plays WebM but not AV1 inside it, and would otherwise pick this and fail.
  {
    src: "/video/brand-video-720.webm",
    type: 'video/webm; codecs="av01.0.05M.08, opus"',
    mobile: true,
  },
  {
    src: "/video/brand-video-720.mp4",
    type: 'video/mp4; codecs="avc1.4D401F, mp4a.40.2"',
    mobile: true,
  },
  {
    src: "/video/brand-video-1080.webm",
    type: 'video/webm; codecs="av01.0.08M.08, opus"',
    mobile: false,
  },
  {
    src: "/video/brand-video-1080.mp4",
    type: 'video/mp4; codecs="avc1.640028, mp4a.40.2"',
    mobile: false,
  },
] as const;

/** Phones get the 720p pair (12–18 MB) instead of the 1080p one (20–37 MB) */
const MOBILE_MEDIA = "(max-width: 768px)";
/** Paints instantly and hides the load (grabbed at 2s — the video fades up from black) */
const VIDEO_POSTER = "/video/brand-video-poster.jpg";

/** How early the video file starts downloading, ahead of entering the viewport */
const PRELOAD_MARGIN = "600px";

/** Scroll distance the lines reveal over — budgeted at ~40vh per line */
const LINES_SCROLL_VH = 160;

/**
 * Extra pinned scroll after the last line: breathing room, the fade, then a 20vh beat of
 * empty screen before the about image slides across. The trailing 100vh is what the image
 * travels over — keep that portion in sync with OVERLAP in about-image-section.tsx.
 */
const VIDEO_TAIL_VH = 160;

/**
 * Quiet scroll after the last line lands, before the section starts fading. Small on
 * purpose: it is a beat, not a pause.
 */
const FADE_DELAY_PX = 200;

/**
 * Scroll the fade itself spans. Has to finish inside the tail: the about plate's top edge
 * reaches the viewport ~40vh after the fade starts, and the point is that nothing visible
 * is left for it to cut across.
 */
const FADE_SCROLL_VH = 30;

/**
 * Message keys under home.manifesto — the copy itself lives in messages/*.json, where the
 * leading Ǝ marks the letter ReversedEText mirrors
 */
const LINE_KEYS = ["line1", "line2", "line3", "line4"] as const;

export function VideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const t = useTranslations("home.manifesto");
  const tHome = useTranslations("home");

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

    // <source> children were just added to an element that started with none — the element
    // only picks them up on an explicit load()
    video.load();

    if (prefersReducedMotion()) return;

    // Distinguishes our own offscreen pause from the user hitting pause in the controls,
    // so scrolling back doesn't override their choice
    let pausedByUs = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.paused && (pausedByUs || video.currentTime === 0)) {
            pausedByUs = false;
            // Muted autoplay is the only kind browsers allow without a user gesture
            void video.play().catch(() => {});
          }
        } else if (!video.paused) {
          // Pausing offscreen keeps decode off the main thread while the page scrolls
          pausedByUs = true;
          video.pause();
        }
      },
      { threshold: 0.4 },
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

      const stage = section.querySelector("[data-video-stage]");
      if (!stage) return;

      // Video and copy dissolve on their own once the reveal is done, so the about plate
      // arrives over an empty screen instead of guillotining a still-visible section.
      gsap.to(stage, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: () =>
            `top top-=${window.innerHeight * (LINES_SCROLL_VH / 100) + FADE_DELAY_PX}`,
          end: () => `+=${window.innerHeight * (FADE_SCROLL_VH / 100)}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-surface pt-20">
      {/*
       * Exactly one viewport tall. Mobile stacks — video on top, the copy dividing up what's
       * left below it. From md the two sit side by side and the row is centred vertically:
       * video flush to the left edge at 70vw, manifesto in the remaining 30vw.
       */}
      <div
        data-video-stage
        className="flex h-dvh flex-col items-center md:flex-row md:items-center"
        style={{ position: "sticky", top: 0 }}
      >
        <div
          data-video-frame
          className="relative aspect-video max-h-[40vh] w-full overflow-hidden bg-surface-muted md:max-h-none md:w-[70vw] md:shrink-0"
        >
          <video
            ref={videoRef}
            poster={VIDEO_POSTER}
            title={tHome("videoTitle")}
            controls
            // Autoplay is only permitted while muted; the renditions do carry an audio
            // track, so viewers can unmute from the controls
            muted
            loop
            playsInline
            disableRemotePlayback
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
          >
            {/* Sources only mount once the section is close, so the initial load pays nothing */}
            {shouldLoad
              ? SOURCES.map((source) => (
                  <source
                    key={source.src}
                    src={source.src}
                    type={source.type}
                    media={source.mobile ? MOBILE_MEDIA : undefined}
                  />
                ))
              : null}
          </video>
        </div>

        {/*
         * Mobile: flex-1 claims everything the video leaves, and space-evenly splits it into
         * five equal gaps — video → line 1, between each line, and line 4 → the viewport
         * bottom where the next section arrives. No fixed margins, so it holds at any height.
         *
         * Desktop: the same flex-1 becomes the 30vw column beside the video, its own height
         * capped so the lines group as a block instead of spanning the full viewport.
         */}
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-evenly px-3 sm:px-6 lg:px-8 md:mx-0 md:h-auto md:max-h-[60vh] md:min-w-0 md:max-w-none md:flex-1 md:gap-8 md:justify-center md:px-8 lg:px-10">
          {LINE_KEYS.map((key) => (
            <p
              key={key}
              data-video-line
              className="text-center text-base leading-relaxed text-text-muted sm:text-lg md:text-left md:text-sm lg:text-base"
            >
              <ReversedEText text={t(key)} />
            </p>
          ))}
        </div>
      </div>

      {/* Scroll runway that keeps the block pinned while the lines reveal, then through the tail */}
      <div style={{ height: `${LINES_SCROLL_VH + VIDEO_TAIL_VH}vh` }} aria-hidden />
    </section>
  );
}
