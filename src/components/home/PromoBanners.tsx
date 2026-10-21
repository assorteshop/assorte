import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Banner = {
  eyebrow: string;
  title: string;
  body?: string;
  cta: string;
  href: string;
  image: string;
  tone: "light" | "red";
};

const banners: Banner[] = [
  {
    eyebrow: "Заряд енергії скрізь, де ти",
    title: "Надійний павербанк для активного життя",
    cta: "Дізнатися більше",
    href: "/catalog?category=power",
    image: "/images/promo-power.jpg",
    tone: "light",
  },
  {
    eyebrow: "Подарунки з характером",
    title: "Скриньки, які дивують",
    body: "Більше, ніж подарунок — це емоція.",
    cta: "До колекції",
    href: "/gifts",
    image: "/images/promo-gifts.jpg",
    tone: "red",
  },
  {
    eyebrow: "Теплі аксесуари на кожен день",
    title: "Стиль, комфорт і турбота",
    cta: "Переглянути",
    href: "/catalog?category=accessories",
    image: "/images/promo-style.jpg",
    tone: "light",
  },
];

export function PromoBanners() {
  return (
    <section className="grid md:grid-cols-[1.2fr_1fr_1fr]">
      {banners.map((b) => (
        <div
          key={b.href}
          className={`relative min-h-[300px] overflow-hidden p-8 md:min-h-[272px] ${
            b.tone === "red" ? "bg-red text-white" : "bg-[#ebe6e0] text-graphite"
          }`}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${b.image})` }}
          />
          <div className="relative flex h-full max-w-[260px] flex-col items-start">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em]">{b.eyebrow}</p>
            <h2 className="mt-4 text-[26px] leading-[1.15]">{b.title}</h2>
            {b.body && <p className="mt-4 text-[13px]">{b.body}</p>}
            <Link
              href={b.href}
              className={`mt-auto inline-flex items-center gap-2 rounded-[4px] px-4 py-2.5 text-[13px] font-medium ${
                b.tone === "red" ? "bg-white text-red" : "bg-red text-white"
              }`}
            >
              {b.cta} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
