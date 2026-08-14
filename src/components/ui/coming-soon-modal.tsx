"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useComingSoonStore } from "@/stores/coming-soon-store";

/**
 * The single "the store isn't open yet" dialog. Mounted once in the root layout and driven
 * from anywhere through {@link useComingSoonStore}.
 */
export function ComingSoonModal() {
  const isOpen = useComingSoonStore((state) => state.isOpen);
  const close = useComingSoonStore((state) => state.close);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations("comingSoon");

  // Portalled to <body>, which only exists on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    // The dialog owns the screen while up — the page behind it must not scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!isMounted || !isOpen) return null;

  /*
   * z-50 puts it above the header (z-40) and the menu panel (z-30) — it can be opened from
   * the navbar, which sits on top of everything else.
   */
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("message")}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
    >
      {/* Click-outside target. A plain div with an onClick needs the keyboard path spelled
          out separately, which Escape above already covers. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-text/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-sm border border-border bg-surface px-6 py-10 text-center sm:max-w-md sm:px-10">
        <p className="font-sans text-sm leading-relaxed uppercase tracking-[0.12em] text-text sm:text-base">
          {t("message")}
        </p>

        <button
          ref={closeRef}
          type="button"
          onClick={close}
          className="mt-8 font-sans text-xs uppercase cursor-pointer tracking-[0.28em] text-text-muted transition hover:text-text"
        >
          <span aria-hidden>·&nbsp;</span>
          {t("close")}
          <span aria-hidden>&nbsp;·</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
