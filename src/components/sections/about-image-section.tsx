import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AboutImagePlate } from "@/components/sections/about-image-plate";
import { DecryptText } from "@/components/ui/decrypt-text";

/**
 * Pulled up over the tail of the (still sticky) video section so the image reads as
 * sliding across it. Keep this in sync with VIDEO_TAIL_VH in video-section.tsx.
 */
const OVERLAP = "100dvh";

/** Scroll the image stays pinned for while the label decrypts */
const DECRYPT_SCROLL_VH = 70;

export async function AboutImageSection() {
  const t = await getTranslations("home");

  return (
    <section
      data-about
      className="relative z-10 w-full bg-surface"
      style={{ marginTop: `-${OVERLAP}` }}
    >
      {/*
       * Exactly one viewport tall. Arrives full-bleed and shrinks into its margins on the
       * way up — the top one clears the navbar, the other three are 15/50px.
       */}
      <AboutImagePlate>
        {/* The whole plate is the link, not just the label */}
        <Link
          href="/about"
          className="relative block h-full w-full cursor-pointer overflow-hidden"
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

          <span className="absolute inset-0 flex items-center justify-center px-6">
            {/*
             * No hover dim: the whole plate is the link, so the pointer is over it almost
             * the entire time the label is on screen — the label just stays solid white.
             */}
            <span className="font-sans text-2xl uppercase tracking-[0.25em] text-white [--decrypt-tracking:0.25em] sm:text-4xl">
              {/*
               * Driven by the section rather than by this element: the plate above is
               * sticky, and the decryption is meant to run over the pinned stretch.
               */}
              <DecryptText
                text={t("aboutCta")}
                triggerSelector="[data-about]"
                scrollVh={DECRYPT_SCROLL_VH}
              />
            </span>
          </span>
        </Link>
      </AboutImagePlate>

      {/* Scroll runway the plate stays pinned over while the label decrypts */}
      <div style={{ height: `${DECRYPT_SCROLL_VH}vh` }} aria-hidden />
    </section>
  );
}
