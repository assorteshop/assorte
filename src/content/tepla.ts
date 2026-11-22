// «Тепла п'ятниця» (Black Friday 2026): texts copied word for word from the founder's Instagram post
// (AI_photo_studio/Экспорт/Feed_4x5/2026-11-22_AC-BF_*). Prices are NOT here: they come from the
// products in the admin («Ціна» and «Ціна зі знижкою»). The page and the home slide live while at
// least one of these products has a sale price; remove the sale prices and both disappear.

export const tepla = {
  path: "/tepla-pyatnytsia",

  seo: {
    title: "Тепла п’ятниця — інверторні кондиціонери зі знижкою | ASSORTE",
    description:
      "Цього року в нас не чорна, а тепла п’ятниця. Інверторні кондиціонери Aerostar DJ AER-12A і CLAIR NEO 9000 BTU: гріють навіть при −15°C. Ціни діють 27–30 листопада.",
  },

  hero: {
    crossed: "Чорна",
    handwritten: "тепла",
    title: "п’ятниця",
    line: "Літо вдома — навіть у листопаді",
    dates: "27–30 листопада",
    photoAlt: "Усміхнена дівчина за столом у теплій кімнаті з кондиціонером Aerostar на стіні, за вікном зима",
  },

  intro: [
    "Цього року в нас не чорна, а тепла п’ятниця. Літо вдома — навіть у листопаді.",
    "Інверторний кондиціонер — це не лише прохолода влітку. Узимку він гріє кімнату, навіть коли надворі −15°C, а в тихому режимі (19 дБ) не заважає спати.",
  ],

  products: [
    {
      slug: "kondytsioner-invertornyi-aerostar-dj-aer-12a-r32-do-35-m-nastinna-split-systema",
      area: "до 35 м²",
      room: "для вітальні",
      name: "Aerostar DJ AER-12A",
      chips: ["Обігрів до −15°C", "Wi-Fi керування", "19 дБ у тихому режимі", "R32"],
      photo: "/images/tepla/aerostar.webp",
      photoAlt: "Кондиціонер Aerostar DJ AER-12A на стіні затишної вітальні, під ним усміхнена дівчина",
    },
    {
      slug: "kondytsioner-invertornyi-cler-neo-9000btu-do-25-m-nastinna-split-systema",
      area: "до 25 м²",
      room: "для спальні",
      name: "CLAIR NEO 9000 BTU",
      chips: ["Обігрів до −15°C", "19 дБ у тихому режимі", "Інвертор", "R32"],
      photo: "/images/tepla/clair.webp",
      photoAlt: "Кондиціонер CLAIR NEO 9000 BTU на стіні світлої спальні, за вікном сніг, поруч дівчина",
    },
  ],

  validNote: "Ціна дійсна 27–30.11",

  choose: {
    title: "Яку обрати?",
    handwritten: "рахуємо за площею",
    cards: [
      { area: "25", rooms: "спальня, кабінет, дитяча", name: "CLAIR NEO" },
      { area: "35", rooms: "вітальня, студія, кухня-вітальня", name: "Aerostar DJ" },
    ],
    delivery: "Оплата при отриманні · Нова пошта або Укрпошта",
    valid: "Ціни дійсні 27–30 листопада",
  },

  closing: "Більше, ніж просто речі",

  ui: { more: "Детальніше", saving: (uah: string) => `−${uah}` },
} as const;
