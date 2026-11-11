import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { zhereb as t } from "@/content/zhereb";

// Home page: a wide «Жереб» card after «Популярні товари», leading to /zhereb.
// Same rounded corners as the product cards; words bottom-left on computers, on the table on phones.
export function ZherebPromo() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-10 pt-2 md:px-8 md:pb-14">
      <Link
        href="/zhereb"
        className="group/zhereb relative block aspect-[9/16] overflow-hidden rounded-[36px] bg-[#5a3a22] text-white sm:aspect-[4/3] md:aspect-[16/7]"
      >
        <picture>
          <source media="(min-width: 640px)" srcSet="/images/zhereb/hero-d_1920.webp" />
          <img
            src="/images/zhereb/hero-m_1200.webp"
            alt={t.hero.photoAlt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[50%_30%] transition-transform duration-700 group-hover/zhereb:scale-[1.03] sm:object-[65%_50%]"
          />
        </picture>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 md:p-12">
          <p className="font-heading text-[48px] font-bold leading-none md:text-[80px]">{t.hero.title}</p>
          <p className="mt-2 font-script text-[19px] leading-tight sm:text-[23px] md:text-[34px]">{t.hero.subtitle}</p>
          <p className="mt-3 hidden max-w-[440px] text-[16px] leading-relaxed text-white/90 sm:block">{t.hero.lead}</p>
          <span className="mt-5 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 sm:mt-6 sm:px-7 sm:py-3.5 text-[15px] font-medium text-graphite transition-colors group-hover/zhereb:bg-red group-hover/zhereb:text-white">
            Дізнатися більше <ArrowRight size={16} aria-hidden />
          </span>
        </div>
      </Link>
    </section>
  );
}
