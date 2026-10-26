export type CategorySlug = "sport" | "tech" | "gifts" | "style" | "climate" | "auto";

export type Category = {
  slug: CategorySlug;
  name: string;
  eyebrow: string;
  description: string;
};

// Order matters: Sport & Active leads the catalogue.
export const categories: Category[] = [
  {
    slug: "sport",
    name: "Спорт і актив",
    eyebrow: "Sport & Active",
    description:
      "Аксесуари для тренувань, відновлення, бігу, фітнесу та подорожей.",
  },
  {
    slug: "tech",
    name: "Tech і гаджети",
    eyebrow: "Tech & Gadgets",
    description:
      "Незвичайні корисні гаджети: повербанки, органайзери для техніки, компактні пристрої для щоденного життя. Ставка на дизайн і користь.",
  },
  {
    slug: "gifts",
    name: "Подарунки",
    eyebrow: "Gifts & Discoveries",
    description:
      "Незвичайні подарунки, головоломки, механічні скриньки та оригінальні речі.",
  },
  {
    slug: "style",
    name: "Стиль і комфорт",
    eyebrow: "Style & Comfort",
    description:
      "Практичні аксесуари, сумки-муфти, речі для комфорту та сезонні знахідки.",
  },
  {
    slug: "climate",
    name: "Кліматична техніка",
    eyebrow: "Climate",
    description:
      "Техніка для комфортного клімату вдома й в офісі: обігрів, охолодження та свіже повітря.",
  },
  {
    slug: "auto",
    name: "Авто і мото",
    eyebrow: "Auto & Moto",
    description: "Корисні аксесуари та речі для автомобіля й мотоцикла.",
  },
];

export const getCategory = (slug: string) =>
  categories.find((c) => c.slug === slug);
