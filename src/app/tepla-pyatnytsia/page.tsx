import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { Heart } from "@/components/brand/Heart";
import { HandStrike } from "@/components/brand/HandStrike";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PartsButton } from "@/components/cart/PartsButton";
import { OldPrice } from "@/components/catalog/OldPrice";
import { tepla as t } from "@/content/tepla";
import { formatUah } from "@/lib/format";
import { oldPriceOf } from "@/lib/sale-price";
import { isIndexingEnabled } from "@/lib/site";
import { getTeplaProducts, isTeplaOn } from "@/lib/tepla";

// «Тепла п'ятниця» (Black Friday 2026), in the style of the Instagram post. Lives while one of its
// products has a sale price (see src/content/tepla.ts); otherwise a 404. Prices come from the admin.

const PRODUCTS_ID = "kondytsionery";

async function load() {
  const products = await getTeplaProducts();
  return { on: isTeplaOn(products), products };
}

export async function generateMetadata(): Promise<Metadata> {
  const { on } = await load();
  if (!on) return { title: "Сторінку не знайдено — ASSORTE", robots: { index: false, follow: false } };
  const open = isIndexingEnabled();
  return {
    title: { absolute: t.seo.title },
    description: t.seo.description,
    alternates: { canonical: t.path },
    openGraph: { title: t.seo.title, description: t.seo.description, images: ["/images/tepla/hero-m.webp"] },
    robots: open ? { index: true, follow: true } : { index: false, follow: false },
  };
}

const wrap = "mx-auto max-w-[1180px] px-5 md:px-8";

/** «Чорна» crossed out by hand, «тепла» written above, «п'ятниця» below — as on the post. */
function Title({ className = "" }: { className?: string }) {
  return (
    <h1 className={`font-heading font-bold leading-[0.95] tracking-[-0.02em] ${className}`}>
      <span className="mb-[0.15em] block pl-[18%] font-script text-[0.62em] font-normal leading-none tracking-normal text-red">
        {t.hero.handwritten}
      </span>
      <span className="relative inline-block">
        {t.hero.crossed}
        <HandStrike width={5} />
      </span>
      <br />
      {t.hero.title}
    </h1>
  );
}

export default async function TeplaPage() {
  const { on, products } = await load();
  if (!on) notFound();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = t.products.flatMap((info) => {
    const product = bySlug.get(info.slug);
    return product ? [{ info, product }] : [];
  });

  return (
    <>
      <Header />
      <main className="bg-ivory text-graphite">
        {/* 1. First screen: the post's cover. Phone: photo with the words over the wall; computer: words left, photo right. */}
        <section className="relative md:mx-auto md:grid md:max-w-[1180px] md:grid-cols-[1fr_minmax(0,500px)] md:items-center md:gap-14 md:px-8 md:py-14">
          <div className="relative h-[calc(100svh-64px)] min-h-[560px] overflow-hidden md:order-2 md:h-auto md:min-h-0 md:rounded-[36px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- one fixed photo from /public, already small WebP */}
            <img
              src="/images/tepla/hero-m.webp"
              alt={t.hero.photoAlt}
              width={1232}
              height={1536}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[50%_30%] md:relative md:aspect-[4/5] md:h-auto"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent md:hidden" />
            {/* Phone: the title sits on the wall under the air conditioner, like on the post. */}
            <div className="absolute inset-x-0 top-[27%] text-center md:hidden">
              <Title className="text-[50px] text-graphite" />
            </div>
            <div className="absolute inset-x-5 bottom-8 md:hidden">
              <p className="font-heading text-[15px] font-bold uppercase tracking-[0.06em] text-white">{t.hero.line}</p>
              <a
                href={`#${PRODUCTS_ID}`}
                className="mt-4 inline-flex items-center gap-3 rounded-full bg-red px-6 py-3.5 text-[16px] font-bold text-white"
              >
                {t.hero.dates}
                <ArrowDown size={17} />
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <Title className="text-[88px] lg:text-[104px]" />
            <p className="mt-8 font-heading text-[18px] font-bold uppercase tracking-[0.06em]">{t.hero.line}</p>
            <a
              href={`#${PRODUCTS_ID}`}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-red px-7 py-4 text-[17px] font-bold text-white transition-colors hover:bg-graphite"
            >
              {t.hero.dates}
              <ArrowDown size={18} />
            </a>
          </div>
        </section>

        {/* 2. A few words from the post. */}
        <section className={`${wrap} py-12 md:py-16`}>
          <div className="max-w-[720px] space-y-4 text-[18px] leading-relaxed md:text-[20px]">
            {t.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        {/* 3. The two air conditioners, like slides 2 and 3. */}
        <section id={PRODUCTS_ID} className={`${wrap} scroll-mt-24 space-y-16 pb-16 md:space-y-24 md:pb-24`}>
          {items.map(({ info, product }, i) => {
            const old = oldPriceOf(product);
            return (
              <article key={info.slug} className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
                <div className={`overflow-hidden rounded-[36px] ${i % 2 ? "md:order-2" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- fixed photo from /public, already small WebP */}
                  <img
                    src={info.photo}
                    alt={info.photoAlt}
                    width={1200}
                    height={1496}
                    loading="lazy"
                    className="aspect-[4/3.4] w-full object-cover object-[50%_15%]"
                  />
                </div>
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-heading text-[15px] font-bold uppercase tracking-[0.12em] text-muted">{info.area}</span>
                    <span className="font-script text-[28px] leading-none text-red">{info.room}</span>
                  </p>
                  <h2 className="mt-2 font-heading text-[34px] font-bold leading-[1.05] tracking-[-0.02em] md:text-[46px]">
                    {info.name}
                  </h2>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {info.chips.map((c) => (
                      <li key={c} className="rounded-full bg-white px-4 py-2 text-[14px]">
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {old !== null && <OldPrice value={old} className="block w-fit text-[20px]" />}
                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <p className="font-heading text-[48px] font-bold leading-none tracking-[-0.02em] md:text-[60px]">
                        {formatUah(product.price_uah)}
                      </p>
                      {old !== null && (
                        <span className="rounded-full bg-red px-4 py-2 font-heading text-[17px] font-bold text-white">
                          {t.ui.saving(formatUah(old - product.price_uah))}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[14px] text-muted">{t.validNote}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <AddToCartButton product={product} variant="inline" />
                    <Link href={`/products/${product.slug}`} className="inline-flex items-center gap-2 text-[15px] font-medium hover:text-red">
                      {t.ui.more}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                  {product.mono_parts && (
                    <div className="mt-4 max-w-[360px]">
                      <PartsButton product={product} hasVariants={product.variantCount > 1} />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* 4. «Яку обрати?», like slide 4. */}
        <section className={`${wrap} pb-16 md:pb-24`}>
          <h2 className="font-heading text-[44px] font-bold leading-none tracking-[-0.02em] md:text-[64px]">{t.choose.title}</h2>
          <p className="mt-2 font-script text-[30px] leading-tight text-red md:text-[38px]">{t.choose.handwritten}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            {t.choose.cards.map((c) => (
                <a
                  key={c.area}
                  href={`#${PRODUCTS_ID}`}
                  className="block rounded-[36px] bg-[#efe8e1] p-8 transition-colors hover:bg-[#e8dfd6] md:p-10"
                >
                  <p className="font-heading font-bold leading-none tracking-[-0.03em]">
                    <span className="text-[80px] md:text-[96px]">{c.area}</span>
                    <span className="text-[30px]"> м²</span>
                  </p>
                  <p className="mt-5 text-[20px] leading-snug">{c.rooms}</p>
                  <p className="mt-8 font-heading text-[22px] font-bold">{c.name}</p>
                </a>
            ))}
          </div>
          <p className="mt-8 text-[18px]">{t.choose.delivery}</p>
          <p className="mt-1 text-[15px] text-muted">{t.choose.valid}</p>
          <p className="mt-12 flex items-center justify-end gap-3 font-script text-[30px] md:text-[36px]">
            {t.closing}
            <Heart className="h-[1em] w-auto text-red" />
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
