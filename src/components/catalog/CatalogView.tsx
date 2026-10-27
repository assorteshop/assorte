import { Suspense } from "react";
import { getCategory, type CategorySlug } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/home/ProductCard";
import { ArticleCardView } from "@/components/blog/ArticleCardView";
import { getArticlesByCategory } from "@/lib/articles";
import { CategoryTabs } from "./CategoryTabs";
import { SearchBox } from "./SearchBox";

async function Grid({ category }: { category?: CategorySlug }) {
  const products = await getProducts(category);
  if (products.length === 0) {
    return <p className="py-16 text-muted">Тут скоро з’являться товари.</p>;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

async function CategoryArticles({ category }: { category: CategorySlug }) {
  const articles = await getArticlesByCategory(category);
  if (articles.length === 0) return null;
  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="text-[26px] md:text-[32px]">Корисні статті</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCardView key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

export function CatalogView({ category }: { category?: CategorySlug }) {
  const current = category ? getCategory(category) : undefined;

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">
        {current?.eyebrow ?? "Каталог Assorte"}
      </p>
      <h1 className="mt-2 text-[32px] md:text-[44px]">{current?.name ?? "Усі товари"}</h1>
      {current && (
        <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-muted">
          {current.description}
        </p>
      )}
      <div className="mt-6">
        <SearchBox id="catalog-q" />
      </div>
      <div className="mt-5">
        <CategoryTabs active={category} />
      </div>
      <div className="mt-8">
        <Suspense fallback={<div className="h-[420px]" aria-hidden />}>
          <Grid category={category} />
        </Suspense>
      </div>
      {category && (
        <Suspense fallback={null}>
          <CategoryArticles category={category} />
        </Suspense>
      )}
    </section>
  );
}
