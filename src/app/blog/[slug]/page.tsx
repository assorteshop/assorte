import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { formatDate } from "@/components/blog/ArticleCardView";
import { StickyBuyBar } from "@/components/blog/StickyBuyBar";
import { ProductCard } from "@/components/home/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { isHtmlArticle, productSlugsIn, readArticle } from "@/lib/article-html";
import { getArticleBySlug, resolveOldArticleSlug, type Article } from "@/lib/articles";
import { formatUah } from "@/lib/format";
import { getProductById, getProductsBySlugs, type ProductCardData } from "@/lib/products";
import { getSiteUrl } from "@/lib/site";

function seoOf(article: Article) {
  const meta = readArticle(article.body);
  return {
    meta,
    title: article.seo_title || meta.seo.title || `${article.title} — ASSORTE`,
    description: article.meta_description || meta.seo.description || article.excerpt || meta.lead || undefined,
    image: article.cover_url ?? meta.firstImage,
  };
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const article = await getArticleBySlug((await props.params).slug);
  if (!article) return { title: "Стаття — ASSORTE" };
  const { title, description, image } = seoOf(article);
  const path = `/blog/${article.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "uk_UA",
      siteName: "ASSORTE",
      title,
      description,
      url: path,
      images: image ? [{ url: image }] : undefined,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

const available = (p: ProductCardData | null | undefined): p is ProductCardData => !!p && p.price_uah > 0;

function Title({ title, accent }: { title: string; accent: string | null }) {
  const i = accent ? title.indexOf(accent) : -1;
  if (!accent || i < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, i)}
      <span className="text-red">{accent}</span>
      {title.slice(i + accent.length)}
    </>
  );
}

async function Content(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    const current = await resolveOldArticleSlug(slug);
    if (current && current !== slug) permanentRedirect(`/blog/${current}`);
    notFound();
  }

  const { meta, description, image } = seoOf(article);
  const ownHeader = !(isHtmlArticle(article.body) && meta.h1);
  const inlineSlugs = productSlugsIn(article.body);
  const [inline, related, primary] = await Promise.all([
    getProductsBySlugs(inlineSlugs),
    getProductsBySlugs(article.related_slugs.filter((s) => !inlineSlugs.includes(s))),
    article.primary_product_id ? getProductById(article.primary_product_id) : Promise.resolve(null),
  ]);
  const inlineBySlug = new Map(inline.filter(available).map((p) => [p.slug, p]));
  const bottom = related.filter(available);
  if (available(primary) && !bottom.some((p) => p.id === primary.id) && !inlineBySlug.has(primary.slug)) {
    bottom.unshift(primary);
  }

  const faq = article.faq.length ? article.faq : meta.faq;
  const showFaqSection = article.faq.length > 0 && meta.faq.length === 0;
  const url = `${getSiteUrl()}/blog/${article.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description,
      image: image ? [image] : undefined,
      datePublished: article.published_at ?? undefined,
      dateModified: article.updated_at ?? article.published_at ?? undefined,
      mainEntityOfPage: url,
      inLanguage: "uk",
      author: { "@type": "Organization", name: "ASSORTE" },
      publisher: { "@type": "Organization", name: "ASSORTE", url: getSiteUrl() },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Головна", item: `${getSiteUrl()}/` },
        { "@type": "ListItem", position: 2, name: "Блог", item: `${getSiteUrl()}/blog` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
    ...(faq.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]
      : []),
  ];

  return (
    <>
      <article className="mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-12">
        <nav aria-label="Навігація" className="text-[12px] text-muted">
          <Link href="/" className="hover:text-red">Головна</Link> / <Link href="/blog" className="hover:text-red">Блог</Link> /{" "}
          <span className="text-graphite">{article.title}</span>
        </nav>

        <div className="mx-auto mt-8 max-w-[760px]">
          {ownHeader ? (
            <header className="mb-8">
              {(article.eyebrow ?? meta.eyebrow) && (
                <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-red">{article.eyebrow ?? meta.eyebrow}</p>
              )}
              <h1 className="text-[clamp(30px,5vw,42px)] leading-[1.15] tracking-[-0.02em]">
                <Title title={article.title} accent={article.title_accent} />
              </h1>
              {article.excerpt && <p className="mt-5 text-[19px] leading-relaxed text-[#3A3A3A]">{article.excerpt}</p>}
              <p className="mt-4 text-[13px] text-muted">
                {formatDate(article.published_at)} · {meta.readingMinutes} хв читання
              </p>
              {article.cover_url && (
                <div className="relative mt-7 aspect-[16/10] overflow-hidden rounded-[16px] bg-[#ece8e2]">
                  <Image src={article.cover_url} alt={article.cover_alt ?? ""} fill priority sizes="(min-width: 800px) 760px, 100vw" className="object-cover" />
                </div>
              )}
            </header>
          ) : (
            <p className="mb-5 text-[13px] text-muted">
              {formatDate(article.published_at)} · {meta.readingMinutes} хв читання
            </p>
          )}

          <ArticleBody
            body={article.body}
            renderProduct={(s) => {
              const p = inlineBySlug.get(s);
              return p ? (
                <div className="my-8 max-w-[360px]">
                  <ProductCard product={p} />
                </div>
              ) : null;
            }}
          />

          {showFaqSection && (
            <section className="mt-14">
              <h2 className="text-[clamp(26px,4vw,32px)] leading-tight">Часті запитання</h2>
              {article.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="mt-7 text-[20px]">{f.q}</h3>
                  <p className="mt-2 text-[17px] leading-[1.7]">{f.a}</p>
                </div>
              ))}
            </section>
          )}

          {!meta.hasSignature && (
            <p className="mt-12 text-center font-script text-[30px] text-red">Більше, ніж просто речі ♡</p>
          )}

          {article.sources.length > 0 && (
            <p className="mt-8 border-t border-line pt-4 text-[13px] text-[#8A847C]">
              Джерела:{" "}
              {article.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ", "}
                  <a href={s.url} target="_blank" rel="nofollow noopener noreferrer" className="underline underline-offset-2">
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>

        {bottom.length > 0 && (
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="text-[26px] md:text-[32px]">Товари зі статті</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bottom.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </article>

      {available(primary) && (
        <StickyBuyBar name={primary.name} price={formatUah(primary.price_uah)} href={`/products/${primary.slug}`} />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

export default function ArticlePage(props: PageProps<"/blog/[slug]">) {
  return (
    <SiteShell>
      <Suspense fallback={<div className="h-[600px]" aria-hidden />}>
        <Content {...props} />
      </Suspense>
    </SiteShell>
  );
}
