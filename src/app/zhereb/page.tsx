import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { zhereb as t } from "@/content/zhereb";
import { getSettings } from "@/lib/settings";

// Hidden landing page «Жереб» (vinyl surprise). Not in the sitemap, menu, header, footer or home page,
// and closed to search engines. It has no site header/footer on purpose: they carry the heart logo,
// and this page must show no hearts. Sales are not open: no prices, cart or checkout here.
export const metadata: Metadata = {
  title: t.seo.title,
  description: t.seo.description,
  robots: { index: false, follow: false },
};

const wrap = "mx-auto max-w-[1180px] px-5 md:px-8";
const h2 = "font-heading text-[30px] font-bold leading-[1.1] md:text-[40px]";

// «Написати нам»: the Telegram link typed in the admin («Налаштування»). Without it the button shows but leads nowhere.
function WriteUs({ href, label }: { href?: string; label: string }) {
  const cls =
    "inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-graphite";
  const inner = (
    <>
      {label} <ArrowRight size={16} aria-hidden />
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

export default async function ZherebPage() {
  const { social_telegram: telegram } = await getSettings();

  return (
    <main className="bg-ivory text-graphite">
      {/* 1. Hero: photo as background; words bottom-left on desktop, on the table (bottom third) on a phone. */}
      <section className="relative flex h-[100svh] min-h-[600px] items-end overflow-hidden bg-ivory text-white">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/images/zhereb/hero-m_1200.webp 1200w, /images/zhereb/hero-m_1600.webp 1600w"
            sizes="100vw"
          />
          {/* A plain img inside picture: different photos for phone and desktop, as the photo studio README asks. */}
          <img
            src="/images/zhereb/hero-d_2400.webp"
            srcSet="/images/zhereb/hero-d_1920.webp 1920w, /images/zhereb/hero-d_2400.webp 2400w, /images/zhereb/hero-d_3840.webp 3840w"
            sizes="100vw"
            alt={t.hero.photoAlt}
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover object-[center_30%] md:object-[65%_center]"
          />
        </picture>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className={`relative w-full pb-7 md:pb-20 ${wrap}`}>
          <div className="max-w-[520px]">
            <h1 className="font-heading text-[48px] font-bold leading-none md:text-[96px]">{t.hero.title}</h1>
            <p className="mt-2 font-script text-[23px] leading-tight md:mt-3 md:text-[38px]">{t.hero.subtitle}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/90 md:mt-4 md:text-[18px]">{t.hero.lead}</p>
            <div className="mt-5 md:mt-7">
              <WriteUs href={telegram} label={t.hero.button} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Опис */}
      <section className={`${wrap} py-16 md:py-24`}>
        <div className="max-w-[760px]">
          <p className="font-heading text-[24px] font-medium leading-snug md:text-[30px]">{t.about[0]}</p>
          <p className="mt-6 text-[16px] leading-relaxed text-muted md:text-[17px]">{t.about[1]}</p>
          <p className="mt-6 text-[16px] font-medium leading-relaxed md:text-[17px]">{t.about[2]}</p>
        </div>
      </section>

      {/* 3. Як це працює */}
      <section className={`${wrap} pb-16 md:pb-24`}>
        <h2 className={h2}>{t.steps.title}</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {t.steps.items.map((step, i) => (
            <li key={step} className="rounded-[28px] bg-white p-6">
              <span className="font-heading text-[40px] font-bold leading-none text-red">{i + 1}</span>
              <p className="mt-4 text-[15px] leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Настрої */}
      <section className={`${wrap} pb-16 md:pb-24`}>
        <h2 className={h2}>{t.moods.title}</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.moods.items.map((m) => (
            <li key={m.name} className="flex flex-col rounded-[36px] bg-[#f0eae3] p-7 md:p-8">
              <h3 className="font-heading text-[24px] font-bold leading-tight">{m.name}</h3>
              <p className="mt-2 font-script text-[24px] leading-snug text-red">{m.slogan}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-graphite/80">{m.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Що всередині + 6. Як подарунок */}
      <section className={`${wrap} grid gap-5 pb-16 md:grid-cols-2 md:pb-24`}>
        <div className="rounded-[36px] bg-white p-7 md:p-10">
          <h2 className={h2}>{t.inside.title}</h2>
          <ul className="mt-6 space-y-2 text-[16px] leading-relaxed">
            {t.inside.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-5 text-[14px] leading-relaxed text-muted">{t.inside.note}</p>
        </div>
        <div className="rounded-[36px] bg-white p-7 md:p-10">
          <h2 className={h2}>{t.gift.title}</h2>
          <p className="mt-6 text-[16px] leading-relaxed">{t.gift.text}</p>
        </div>
      </section>

      {/* 7. Листівка: two sides of the card, flat, no 3D or animation. */}
      <section className={`${wrap} pb-16 md:pb-24`}>
        <h2 className={h2}>{t.card.title}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="grid min-h-[300px] place-items-center rounded-[10px] bg-white p-8 shadow-[0_2px_16px_rgba(23,23,23,0.08)]">
            <p className="font-script text-[52px] leading-none md:text-[64px]">{t.card.front}</p>
          </div>
          <div className="rounded-[10px] bg-white p-7 text-[14px] leading-relaxed shadow-[0_2px_16px_rgba(23,23,23,0.08)] md:p-9">
            <p className="font-heading text-[18px] font-bold">{t.card.back.album}</p>
            <p className="mt-4 font-medium">{t.card.back.whyLabel}</p>
            <p className="mt-1 text-graphite/80">{t.card.back.why}</p>
            <p className="mt-4 font-medium">{t.card.back.howLabel}</p>
            <p className="mt-1 text-graphite/80">{t.card.back.how}</p>
            <div className="mt-5 space-y-1 font-script text-[20px] leading-snug">
              {t.card.back.closing.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-6 border-t border-line pt-4 text-[12px] uppercase tracking-[0.12em] text-muted">
              {t.card.back.signature}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-muted">{t.card.caption}</p>
      </section>

      {/* 8. Запитання: native details/summary. */}
      <section className={`${wrap} pb-16 md:pb-24`}>
        <h2 className={h2}>{t.faq.title}</h2>
        <div className="mt-8 max-w-[820px] divide-y divide-line rounded-[28px] bg-white px-6 md:px-8">
          {t.faq.items.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="shrink-0 text-[22px] font-medium text-red transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-graphite/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 9. Фінал */}
      <section className={`${wrap} pb-20 md:pb-28`}>
        <div className="rounded-[36px] bg-[#f0eae3] px-7 py-12 text-center md:py-16">
          <p className="mx-auto max-w-[640px] font-script text-[32px] leading-tight md:text-[42px]">{t.final.text}</p>
          <div className="mt-8">
            <WriteUs href={telegram} label={t.final.button} />
          </div>
        </div>
      </section>
    </main>
  );
}
