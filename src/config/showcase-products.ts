export type ShowcaseProduct = {
  id: string;
  title: string;
  price: string;
  href: string;
  image: string;
  imageAspect: string;
  /** Mobile: width, alignment, spacing */
  mobileClass: string;
  /** Desktop: grid column placement */
  desktopClass: string;
};

export const SHOWCASE_PRODUCTS: ShowcaseProduct[] = [
  {
    id: "1",
    title: "Chaqueta Drapped",
    price: "COP 250.000",
    href: "/products",
    image: "/images/p1.png",
    imageAspect: "aspect-[3/4]",
    mobileClass: "w-[88%] self-start",
    desktopClass: "md:col-span-5 md:col-start-1 md:row-start-1",
  },
  {
    id: "2",
    title: "Falda Drapped",
    price: "COP 110.000",
    href: "/products",
    image: "/images/p2.png",
    imageAspect: "aspect-[4/5]",
    mobileClass: "w-[58%] self-end mt-10",
    desktopClass: "md:col-span-4 md:col-start-8 md:row-start-1 md:mt-28",
  },
  {
    id: "3",
    title: "Chaqueta Karaoke paraíso",
    price: "COP 350.000",
    href: "/products",
    image: "/images/p3.png",
    imageAspect: "aspect-square",
    mobileClass: "w-[48%] self-start mt-16",
    desktopClass: "md:col-span-3 md:col-start-2 md:row-start-2 md:mt-20",
  },
  {
    id: "4",
    title: "Bermuda Gaucha",
    price: "COP 130.000",
    href: "/products",
    image: "/images/p4.png",
    imageAspect: "aspect-[3/5]",
    mobileClass: "w-[64%] self-end mt-14",
    desktopClass: "md:col-span-4 md:col-start-7 md:row-start-2 md:mt-36",
  },
  {
    id: "5",
    title: "Medias roma",
    price: "COP 110.000",
    href: "/products",
    image: "/images/p5.png",
    imageAspect: "aspect-square",
    mobileClass: "w-[44%] self-start mt-12",
    desktopClass: "md:col-span-3 md:col-start-1 md:row-start-3 md:mt-16",
  },
  {
    id: "6",
    title: "Chaqueta Porcelana",
    price: "COP 350.000",
    href: "/products",
    image: "/images/p6.png",
    imageAspect: "aspect-[16/10]",
    mobileClass: "w-full mt-16",
    desktopClass: "md:col-span-6 md:col-start-4 md:row-start-3 md:mt-24",
  },
];
