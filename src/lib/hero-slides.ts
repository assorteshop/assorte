// Photos of Alex, the face of ASSORTE, for the full-screen first screen of the home page.
// Web copies made from AI_photo_studio/Исходники (originals untouched, metadata stripped).
// The two lemon photos go first. To change the order or a photo, edit this list.

export type HeroSlide = {
  id: string;
  /** Landscape crop for computers; null when the photo is too small to fill a wide screen. */
  desktop: string | null;
  /** Portrait photo for phones (and, without a desktop crop, the photo shown on the right on computers). */
  mobile: string;
  /** Backdrop colour taken from the photo, shown while it loads and around a portrait on computers. */
  bg: string;
  alt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "lemon-eye",
    desktop: "/images/home/hero/lemon-eye-d.webp",
    mobile: "/images/home/hero/lemon-eye-m.webp",
    bg: "#b85555",
    alt: "Алекс закриває око половинкою лимона",
  },
  {
    id: "lemon-chin",
    desktop: null,
    mobile: "/images/home/hero/lemon-chin-m.webp",
    bg: "#b4574f",
    alt: "Алекс тримає половинку лимона біля обличчя",
  },
  {
    id: "flowers",
    desktop: "/images/home/hero/flowers-d.webp",
    mobile: "/images/home/hero/flowers-m.webp",
    bg: "#e9715f",
    alt: "Алекс з великим букетом польових квітів",
  },
  {
    id: "tulips",
    desktop: "/images/home/hero/tulips-d.webp",
    mobile: "/images/home/hero/tulips-m.webp",
    bg: "#f3e9e5",
    alt: "Алекс усміхається з букетом червоних тюльпанів",
  },
  {
    id: "blazer",
    desktop: "/images/home/hero/blazer-d.webp",
    mobile: "/images/home/hero/blazer-m.webp",
    bg: "#3d403b",
    alt: "Алекс в оливковому жакеті",
  },
  {
    id: "golden",
    desktop: "/images/home/hero/golden-d.webp",
    mobile: "/images/home/hero/golden-m.webp",
    bg: "#3a1e08",
    alt: "Алекс у теплому вечірньому світлі",
  },
];
