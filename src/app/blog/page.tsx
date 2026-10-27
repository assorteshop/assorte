import type { Metadata } from "next";
import { ArticleCardView } from "@/components/blog/ArticleCardView";
import { SiteShell } from "@/components/SiteShell";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Блог — ASSORTE",
  description: "Гіди та огляди ASSORTE: як обрати корисні речі, гаджети й подарунки.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const articles = await getArticles();
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red">Гіди та огляди</p>
        <h1 className="mt-2 text-[32px] md:text-[44px]">Блог</h1>
        {articles.length === 0 ? (
          <p className="mt-8 text-muted">Статті скоро з’являться.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCardView key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
