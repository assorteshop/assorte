import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Markdown } from "@/components/Markdown";
import { ProductCard } from "@/components/home/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { getArticleBySlug } from "@/lib/articles";
import { getProductsBySlugs } from "@/lib/products";

export async function generateMetadata(props: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const article = await getArticleBySlug((await props.params).slug);
  return article
    ? { title: `${article.title} — ASSORTE`, description: article.excerpt || undefined }
    : { title: "Стаття — ASSORTE" };
}

async function Content(props: PageProps<"/articles/[slug]">) {
  const article = await getArticleBySlug((await props.params).slug);
  if (!article) notFound();
  const related = await getProductsBySlugs(article.related_slugs);

  return (
    <article className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <nav aria-label="Навігація" className="text-[12px] text-muted">
        <Link href="/articles" className="hover:text-red">Статті</Link>
      </nav>
      <div className="mx-auto mt-6 max-w-[720px]">
        <h1 className="text-[32px] leading-tight md:text-[44px]">{article.title}</h1>
        {article.published_at && (
          <p className="mt-3 text-[13px] text-muted">
            {new Date(article.published_at).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {article.cover_url && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[6px] bg-[#ece8e2]">
            <Image src={article.cover_url} alt="" fill priority sizes="720px" className="object-cover" />
          </div>
        )}
        <div className="mt-2">
          <Markdown>{article.body}</Markdown>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t border-line pt-10">
          <h2 className="text-[26px]">Товари зі статті</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default function ArticlePage(props: PageProps<"/articles/[slug]">) {
  return (
    <SiteShell>
      <Suspense fallback={<div className="h-[600px]" aria-hidden />}>
        <Content {...props} />
      </Suspense>
    </SiteShell>
  );
}
