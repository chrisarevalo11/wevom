import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ComingSoonModal } from "@/components/ui/coming-soon-modal";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ProductTransitionOverlay } from "@/components/ui/product-transition-overlay";
import { siteConfig } from "@/config/site";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { fontVariables, sourceCodePro } from "@/lib/fonts";
import { Providers } from "./providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("site")]);
  const description = t("description");

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: siteConfig.url,
      siteName: siteConfig.name,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={fontVariables}>
      <body
        className={`${sourceCodePro.className} min-h-screen flex flex-col font-sans`}
      >
        {/* No props needed: rendered from a Server Component, it inherits locale and
            messages from the request config */}
        <NextIntlClientProvider>
          <Providers>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            {/* One instance for every entry point that would otherwise start a purchase */}
            <ComingSoonModal />
            {/* Outlives both pages, so a product image can cross between them */}
            <ProductTransitionOverlay />
            {/* Renders nothing on touch devices and under reduced motion */}
            <CustomCursor />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
