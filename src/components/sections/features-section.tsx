"use client";

import { useGsapReveal } from "@/hooks/use-gsap-reveal";

const features = [
  {
    title: "Premium materials",
    description: "Every product is made with carefully selected, durable materials.",
  },
  {
    title: "Fast shipping",
    description: "Orders are processed quickly and delivered to your door.",
  },
  {
    title: "Secure checkout",
    description: "Shop with confidence through Shopify's secure payment flow.",
  },
];

export function FeaturesSection() {
  const ref = useGsapReveal<HTMLElement>({ childSelector: "[data-reveal]" });

  return (
    <section
      ref={ref}
      data-features
      className="relative z-10 -mt-[100vh] bg-surface py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[80vh] bg-gradient-to-b from-surface/0 via-surface/60 to-surface"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Why choose us</h2>
          <p className="mt-4 text-text-muted">
            Quality, speed, and trust built into every order.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              data-reveal
              className="rounded-2xl border border-border bg-surface p-8"
            >
              <h3 className="text-lg font-medium">{feature.title}</h3>
              <p className="mt-3 text-sm text-text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
