import Image from "next/image";
import Link from "next/link";

/**
 * Pulled up over the tail of the (still sticky) video section so the image reads as
 * sliding across it. Keep this in sync with VIDEO_TAIL_VH in video-section.tsx.
 */
const OVERLAP = "100dvh";

export function AboutImageSection() {
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

      <div className="sticky top-1/2 flex -translate-y-1/2 justify-center pt-5">
        <Link
          href="/about"
          className="font-sans text uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-70 sm:text-base"
        >
          Sobre EVOM
        </Link>
      </div>
    </section>
  );
}
