import { LandingPageShell } from "@/components/layout/landing-page-shell";
import { AboutImageSection } from "@/components/sections/about-image-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProductShowcaseSection } from "@/components/sections/product-showcase-section";
import { VideoSection } from "@/components/sections/video-section";
import { getShowcaseItems } from "@/features/products/catalog";

export default async function HomePage() {
  const showcase = await getShowcaseItems();

  return (
    <LandingPageShell>
      <HeroSection />
      {/* Nothing to show (store unconfigured or empty) — the section leaves, the page stays */}
      {showcase.length > 0 ? <ProductShowcaseSection items={showcase} /> : null}
      <VideoSection />
      <AboutImageSection />
    </LandingPageShell>
  );
}
