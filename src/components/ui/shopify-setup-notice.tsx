"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function ShopifySetupNotice() {
  const t = useTranslations("setupNotice");

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
      <p className="font-medium">{t("title")}</p>
      <p className="mt-2">
        {/* Env var names stay inside the message so word order remains translatable */}
        {t.rich("body", {
          code: (chunks) => <code className="rounded bg-white px-1">{chunks}</code>,
        })}
      </p>
      <Link
        href="/products"
        className="mt-4 inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
