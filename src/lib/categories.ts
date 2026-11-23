export type CategorySlug = "sport" | "tech" | "gifts" | "style" | "climate" | "auto" | "watches";

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
    eyebrow: "Подарунки",
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
  {
    slug: "watches",
    name: "Годинники",
    eyebrow: "Годинники",
    description: "Наручні та смарт-годинники для чоловіків, жінок і дітей, аксесуари до них.",
  },
];

// «Годинники» has sub-sections: «Для кого» (its own page, /catalog/watches/men) and «Тип»
// (switches on the page). Stored on products as `audience` and `subtype` (supabase/migration-watches.sql).
export type Audience = "men" | "women" | "kids";
export type Subtype = "wrist" | "smart" | "accessories";

export const audiences: { slug: Audience; name: string }[] = [
  { slug: "men", name: "Чоловікам" },
  { slug: "women", name: "Жінкам" },
  { slug: "kids", name: "Дитячі" },
];

export const subtypes: { slug: Subtype; name: string }[] = [
  { slug: "wrist", name: "Наручні" },
  { slug: "smart", name: "Смарт" },
  { slug: "accessories", name: "Аксесуари" },
];

/** Categories that have the «Для кого» / «Тип» sub-sections. */
export const hasSubsections = (slug: string | null | undefined) => slug === "watches";

export const getAudience = (slug: string) => audiences.find((a) => a.slug === slug);

export const getCategory = (slug: string) =>
  categories.find((c) => c.slug === slug);
