"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Resting diameter, and the 35px it grows to over anything clickable */
const SIZE = 25;
const HOVER_SCALE = 35 / SIZE;

/** What counts as clickable. Matches the native pointer cursor's own rules closely enough */
const INTERACTIVE_SELECTOR =
  'a[href], button:not(:disabled), [role="button"], label[for], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [data-cursor="pointer"]';

/**
 * The press: the ring dips to this fraction of whatever size it is currently at, then springs
 * back. Relative rather than absolute so the dip reads the same over a link (where the ring is
 * already swollen) as it does anywhere else.
 */
const PRESS_SCALE = 0.7;
const PRESS_IN = 0.1;
const PRESS_OUT = 0.5;

/** Held back until the pointer's real position is known, so the ring never flies in from 0,0 */
const REVEAL_DELAY = 0.3;
const REVEAL_DURATION = 0.4;

/** Only replaces a real mouse — never a finger, and never a stylus-less touch screen */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Replaces the system cursor with a hairline ring that swells over anything clickable.
 *
 * Mounted once at the root. Position is written straight to the transform on every mouse
 * move rather than through React state — a re-render per mousemove event would be visible.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const query = window.matchMedia(FINE_POINTER);
    const apply = () => setIsEnabled(query.matches);

    apply();
    query.addEventListener("change", apply);

    return () => query.removeEventListener("change", apply);
  }, []);

  // The native cursor only goes away while ours is actually up, so a touch device — or a
  // mouse unplugged mid-session — is never left with no cursor at all.
  useEffect(() => {
    if (!isEnabled) return;

    document.documentElement.classList.add("cursor-none");

    return () => document.documentElement.classList.remove("cursor-none");
  }, [isEnabled]);

  useGSAP(
    () => {
      const cursor = cursorRef.current;
      if (!cursor || !isEnabled) return;

      // Starts hidden at the origin. Until the mouse actually moves there is no way to know
      // where it is, and animating in from the top-left corner is the jump this avoids.
      gsap.set(cursor, { autoAlpha: 0, x: 0, y: 0 });

      // quickTo keeps a single reusable tween per axis: the ring trails the pointer by a
      // few frames, which is what stops it from feeling like a pasted-on graphic.
      const moveX = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3.out" });
      const moveY = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3.out" });

      let isPointing = false;
      let hasPosition = false;

      /** What the ring settles back to once nothing is pressing it */
      const restingScale = () => (isPointing ? HOVER_SCALE : 1);

      const onMove = (event: MouseEvent) => {
        if (hasPosition) {
          moveX(event.clientX);
          moveY(event.clientY);
        } else {
          // First sighting: land on the pointer with no tween at all, then fade up in place
          hasPosition = true;
          gsap.set(cursor, { x: event.clientX, y: event.clientY });
          gsap.to(cursor, {
            autoAlpha: 1,
            duration: REVEAL_DURATION,
            delay: REVEAL_DELAY,
            ease: "power2.out",
          });
        }

        const target = event.target as Element | null;
        const pointing = Boolean(target?.closest?.(INTERACTIVE_SELECTOR));

        if (pointing === isPointing) return;
        isPointing = pointing;
        gsap.to(cursor, {
          scale: pointing ? HOVER_SCALE : 1,
          duration: 0.25,
          ease: "power3.out",
        });
      };

      // A press on anything clickable. overwrite clears the hover tween rather than racing
      // it, and the tail springs back to whatever the ring should be resting at by then.
      const onPress = (event: MouseEvent) => {
        const target = event.target as Element | null;
        if (!target?.closest?.(INTERACTIVE_SELECTOR)) return;

        gsap
          .timeline({ overwrite: true })
          .to(cursor, {
            scale: restingScale() * PRESS_SCALE,
            duration: PRESS_IN,
            ease: "power2.out",
          })
          .to(cursor, {
            scale: restingScale,
            duration: PRESS_OUT,
            ease: "elastic.out(1, 0.55)",
          });
      };

      // Leaving the window entirely would otherwise strand the ring at the last edge it saw
      const onLeave = () => gsap.to(cursor, { autoAlpha: 0, duration: 0.2 });
      const onEnter = () => {
        if (hasPosition) gsap.to(cursor, { autoAlpha: 1, duration: 0.2 });
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mousedown", onPress, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      document.addEventListener("mouseenter", onEnter);

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousedown", onPress);
        document.removeEventListener("mouseleave", onLeave);
        document.removeEventListener("mouseenter", onEnter);
      };
    },
    { dependencies: [isEnabled] },
  );

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none invisible fixed left-0 top-0 z-[100] rounded-full border border-black opacity-0"
      style={{
        width: SIZE,
        height: SIZE,
        // Centres the ring on the pointer without a translate utility — Tailwind's would
        // compile to the standalone `translate` property and compose with, rather than be
        // overridden by, the transform GSAP writes here.
        margin: `${-SIZE / 2}px 0 0 ${-SIZE / 2}px`,
      }}
    />
  );
}
