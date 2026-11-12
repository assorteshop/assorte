import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { InstagramButton } from "@/components/zhereb/InstagramButton";
import { MoodPicker } from "@/components/zhereb/MoodPicker";
import { MOODS_ID, ZherebCta } from "@/components/zhereb/ZherebCta";
import { zhereb as t } from "@/content/zhereb";
import { getZherebVariants } from "@/lib/products";
import { isIndexingEnabled } from "@/lib/site";
import { isZherebOn } from "@/lib/zhereb";

// «Жереб» (vinyl surprise) — the selling page. It lives only while «Жереб» products are published
// (article ZHEREB, variants «<Рівень> · <Настрій>»); otherwise /zhereb is a 404. That is the launch switch.
// Prices come only from the database. Not in the menu; the sitemap lists it only while it is on.
const moodNames = t.moods.items.map((m) => m.name);
const tierIds = t.tiers.items.map((x) => x.id);

async function load() {
  const variants = await getZherebVariants();
  return { on: isZherebOn(tierIds, moodNames, variants), variants };
}

export async function generateMetadata(): Promise<Metadata> {
  const { on } = await load();
  if (!on) return { title: "Сторінку не знайдено — ASSORTE", robots: { index: false, follow: false } };
  const open = isIndexingEnabled();
  return {
    title: { absolute: t.seo.title },
    description: t.seo.description,
    alternates: { canonical: "/zhereb" },
    robots: open
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

const wrap = "mx-auto max-w-[1180px] px-5 md:px-8";
const h2 = "font-heading text-[30px] font-bold leading-[1.1] md:text-[40px]";

export default async function ZherebPage() {
  const { on, variants } = await load();
  if (!on) notFound();

  return (
    <>
      <Header overlay />
      {/* Phones get room at the bottom for the order bar. */}
      <main className="bg-ivory pb-20 text-graphite md:pb-0">
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
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
          />
          <div className={`relative w-full pb-7 md:pb-20 ${wrap}`}>
            <div className="max-w-[520px]">
              <h1 className="font-heading text-[48px] font-bold leading-none md:text-[96px]">
                {t.hero.title}
              </h1>
              <p className="mt-2 font-script text-[23px] leading-tight md:mt-3 md:text-[38px]">
                {t.hero.subtitle}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/90 md:mt-4 md:text-[18px]">
                {t.hero.lead}
              </p>
              <div className="mt-5 md:mt-7">
                <ZherebCta label={t.hero.button} />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Опис */}
        <section className={`${wrap} py-16 md:py-24`}>
          <div className="max-w-[760px]">
            <p className="font-heading text-[24px] font-medium leading-snug md:text-[30px]">
              {t.about[0]}
            </p>
            <p className="mt-6 text-[16px] leading-relaxed text-muted md:text-[17px]">
              {t.about[1]}
            </p>
            <p className="mt-6 text-[16px] font-medium leading-relaxed md:text-[17px]">
              {t.about[2]}
            </p>
          </div>
        </section>

        {/* Настрої → the order panel (level, hints, cart) */}
        <section
          id={MOODS_ID}
          className={`${wrap} scroll-mt-20 pb-16 md:pb-24`}
        >
          <MoodPicker variants={variants} />
        </section>

        {/* After the moods and the order panel: Як це працює (five steps). */}
        <section className={`${wrap} pb-16 md:pb-24`}>
          <h2 className={h2}>{t.steps.title}</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {t.steps.items.map((step, i) => (
              <li key={step} className="rounded-[28px] bg-white p-6">
                <span className="font-heading text-[40px] font-bold leading-none text-red">
                  {i + 1}
                </span>
                <p className="mt-4 text-[15px] leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
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
            <p className="mt-5 text-[14px] leading-relaxed text-muted">
              {t.inside.note}
            </p>
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
              <p className="font-script text-[52px] leading-none md:text-[64px]">
                {t.card.front}
              </p>
            </div>
            <div className="rounded-[10px] bg-white p-7 text-[14px] leading-relaxed shadow-[0_2px_16px_rgba(23,23,23,0.08)] md:p-9">
              <p className="font-heading text-[18px] font-bold">
                {t.card.back.album}
              </p>
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

        {/* 7½. Поділіться моментом: an invitation only — no videos, photos, reviews or counters yet. */}
        <section className={`${wrap} pb-16 md:pb-24`}>
          <div className="rounded-[36px] bg-white p-7 md:p-12">
            <h2 className={h2}>{t.moment.title}</h2>
            <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed md:text-[17px]">{t.moment.lead}</p>
            <ol className="mt-8 grid gap-3 md:grid-cols-3 md:gap-5">
              {t.moment.steps.map((step, i) => (
                <li key={step} className="flex gap-4 rounded-[24px] bg-ivory p-5">
                  <span className="font-heading text-[26px] font-bold leading-none text-red">{i + 1}</span>
                  <p className="text-[15px] leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed text-graphite/80">{t.moment.gift}</p>
            <div className="mt-7">
              <InstagramButton href={t.moment.instagramUrl} label={t.moment.button} />
            </div>
            <p className="mt-3 text-[13px] text-muted">{t.moment.hashtag}</p>
          </div>
        </section>

        {/* 8. Запитання: native details/summary. */}
        <section className={`${wrap} pb-16 md:pb-24`}>
          <h2 className={h2}>{t.faq.title}</h2>
          <div className="mt-8 max-w-[820px] divide-y divide-line rounded-[28px] bg-white px-6 md:px-8">
            {t.faq.items.filter((f) => f.a).map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="shrink-0 text-[22px] font-medium text-red transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-graphite/80">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 9. Фінал */}
        <section className={`${wrap} pb-20 md:pb-28`}>
          <div className="rounded-[36px] bg-[#f0eae3] px-7 py-12 text-center md:py-16">
            <p className="mx-auto max-w-[640px] font-script text-[32px] leading-tight md:text-[42px]">
              {t.final.text}
            </p>
            <div className="mt-8">
              <ZherebCta label={t.final.button} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
