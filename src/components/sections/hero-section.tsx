import { LocaleSwitch } from "@/components/layout/locale-switch";
import { LOCALE_SWITCH_TOP } from "@/config/layout";

export function HeroSection() {
  return (
    <section data-hero className="relative min-h-[200vh] md:min-h-[250vh]">
      {/*
       * Sticky rather than fixed: it holds under the body's feet for the whole hero runway,
       * then scrolls away with the section as the showcase arrives. Sticky shifts the box
       * down to the offset on its own, so no absolute positioning or spacer is needed.
       */}
      <div className={`sticky ${LOCALE_SWITCH_TOP} flex justify-center`}>
        <LocaleSwitch />
      </div>
    </section>
  );
}
