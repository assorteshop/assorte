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
  /** Tailwind classes that place the photo inside the frame (phone first, then md:). */
  position?: string;
  /** Words over the photo: the brand line (default) or the «Жереб» invitation. */
  text?: "brand" | "zhereb";
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

// «Жереб»: Alex with the craft envelope (photo studio export, AI label kept in the file metadata).
// Placement follows the photo README: phone centre 30%, computer 65% centre.
export const zherebSlide: HeroSlide = {
  id: "zhereb",
  desktop: "/images/zhereb/hero-d_2400.webp",
  mobile: "/images/zhereb/hero-m_1200.webp",
  bg: "#5a3a22",
  alt: "Дівчина в затишній вінтажній кімнаті тримає крафтовий конверт „Жереб“",
  position: "object-[50%_30%] md:object-[65%_50%]",
  text: "zhereb",
};

// The first screen alternates two photos: the lemon at the eye, then «Жереб».
// All other photos stay above; to show them all, set this to heroSlides.
export const shownHeroSlides: HeroSlide[] = [heroSlides[0], zherebSlide];
