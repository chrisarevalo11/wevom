import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * Pulled up over the tail of the (still sticky) video section so the image reads as
 * sliding across it. Keep this in sync with VIDEO_TAIL_VH in video-section.tsx.
 */
const OVERLAP = "100dvh";

export async function AboutImageSection() {
  const t = await getTranslations("home");

  return (
    <section
      className="relative z-10 h-[150dvh] w-full bg-surface-muted py-10"
      style={{ marginTop: `-${OVERLAP}` }}
    >
      <Image
        src="/images/home-about-section.png"
        alt=""
        fill
        priority={false}
        className="object-cover"
        sizes="100vw"
        aria-hidden
      />

      {/*
       * Was a link to /about. That route is off until the page is ready, so the label stays
       * as the caption over the image — restore the Link when the page ships.
       */}
      <div className="sticky top-1/2 flex -translate-y-1/2 justify-center pt-5">
        <p className="font-sans text uppercase tracking-[0.25em] text-black sm:text-base">
          {t("aboutCta")}
        </p>
      </div>
    </section>
  );
}
