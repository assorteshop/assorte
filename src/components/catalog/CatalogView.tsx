import { Suspense } from "react";
import { getAudience, getCategory, hasSubsections, type Audience, type CategorySlug } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { ArticleCardView } from "@/components/blog/ArticleCardView";
import { getArticlesByCategory } from "@/lib/articles";
import { CatalogGrid } from "./CatalogGrid";
import { CatalogPills, CatalogSideNav } from "./CatalogNav";
import { SearchBox } from "./SearchBox";

async function Grid({ category, audience }: { category?: CategorySlug; audience?: Audience }) {
  const products = await getProducts(category, audience);
  return <CatalogGrid products={products} withTypes={hasSubsections(category)} />;
}

async function CategoryArticles({ category }: { category: CategorySlug }) {
  const articles = await getArticlesByCategory(category);
  if (articles.length === 0) return null;
  return (
    <section className="mt-20 border-t border-line pt-10">
      <h2 className="text-[26px] md:text-[32px]">Корисні статті</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {articles.map((a) => (
          <ArticleCardView key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

// The catalogue: on a computer the categories stand in a quiet column on the left and the
// products on the right; on a phone the categories are pills above. Only the title, no extra text.
export function CatalogView({ category, audience }: { category?: CategorySlug; audience?: Audience }) {
  const current = category ? getCategory(category) : undefined;
  const who = audience ? getAudience(audience) : undefined;
  const title = current ? (who ? `${current.name} · ${who.name}` : current.name) : "Усі товари";

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-8 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-12 md:px-8 md:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16">
      <aside className="hidden md:block">
        <CatalogSideNav active={category} audience={audience} />
      </aside>
      <div>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-heading text-[34px] font-bold leading-[1.05] tracking-[-0.02em] md:text-[52px]">{title}</h1>
          <div className="lg:w-[340px]">
            <SearchBox id="catalog-q" />
          </div>
        </div>
        <div className="mt-6">
          <CatalogPills active={category} audience={audience} />
        </div>
        <div className="mt-8 md:mt-10">
          <Suspense fallback={<div className="h-[520px]" aria-hidden />}>
            <Grid category={category} audience={audience} />
          </Suspense>
        </div>
        {category && (
          <Suspense fallback={null}>
            <CategoryArticles category={category} />
          </Suspense>
        )}
      </div>
    </section>
  );
}
