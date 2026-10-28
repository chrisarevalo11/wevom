import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BRAND_NAME } from "@/config/brand";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.meta");

  return { title: t("title"), description: t("description", { brand: BRAND_NAME }) };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <p className="font-sans text-xs uppercase tracking-[0.24em] text-text-muted">
        {t("eyebrow")}
      </p>
      <h1 className="mt-4 font-wordmark text-3xl font-medium uppercase tracking-[0.08em] text-text sm:text-4xl">
        {t("title")}
      </h1>
      <div className="mt-8 space-y-6 font-sans text-sm leading-relaxed text-text-muted">
        <p>{t("body1", { brand: BRAND_NAME })}</p>
        <p>{t("body2")}</p>
        <p>{t("body3")}</p>
      </div>
    </div>
  );
}
