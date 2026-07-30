import { LandingPageShell } from "@/components/layout/landing-page-shell";
import { AboutImageSection } from "@/components/sections/about-image-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProductShowcaseSection } from "@/components/sections/product-showcase-section";
import { VideoSection } from "@/components/sections/video-section";

export default function HomePage() {
  return (
    <LandingPageShell>
      <HeroSection />
      <ProductShowcaseSection />
      <VideoSection />
      <AboutImageSection />
    </LandingPageShell>
  );
}
