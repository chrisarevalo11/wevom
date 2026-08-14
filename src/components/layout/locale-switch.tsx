"use client";

import { useLocale, useTranslations } from "next-intl";
import { Fragment, useTransition } from "react";
import { LOCALES, type Locale } from "@/i18n/locales";
import { setLocale } from "@/i18n/set-locale";
import { cn } from "@/lib/utils/cn";

export function LocaleSwitch({ className }: { className?: string }) {
  const t = useTranslations("locale");
  const active = useLocale();
  const [isPending, startTransition] = useTransition();

  return (
    // fieldset over a div with role="group": same grouping semantics, native element. The
    // legend names the group for screen readers without showing on screen.
    <fieldset className={cn("flex items-center gap-2 border-0 p-0", className)}>
      <legend className="sr-only">{t("label")}</legend>
      {LOCALES.map((locale, index) => {
        const isActive = locale === active;

        return (
          <Fragment key={locale}>
            {index > 0 ? (
              <span aria-hidden className="text-text-muted">
                /
              </span>
            ) : null}
            <button
              type="button"
              // Switching writes a cookie server-side and re-renders the route, so the
              // transition is what keeps the click from feeling dropped meanwhile
              onClick={() => startTransition(() => setLocale(locale as Locale))}
              disabled={isPending || isActive}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "font-sans text-xs uppercase tracking-[0.24em] transition sm:text-sm",
                isActive
                  ? "font-semibold text-text"
                  : "text-text-muted hover:text-text",
              )}
            >
              {t(locale)}
            </button>
          </Fragment>
        );
      })}
    </fieldset>
  );
}
