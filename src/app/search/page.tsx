import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { ProductCard } from "@/components/home/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { searchProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Пошук — ASSORTE", robots: { index: false } };

async function Results({ query }: { query: string }) {
  if (!query) {
    return <p className="py-10 text-muted">Введіть назву товару, артикул або категорію.</p>;
  }
  const products = await searchProducts(query);

  if (products.length === 0) {
    return (
      <div className="py-10">
        <p className="text-[17px]">Нічого не знайдено за запитом «{query}».</p>
        <p className="mt-2 text-[14px] text-muted">
          Спробуйте інше слово або перегляньте{" "}
          <Link href="/catalog" className="text-red underline underline-offset-4">весь каталог</Link>.
        </p>
      </div>
    );
  }
  return (
    <>
      <p className="py-6 text-[14px] text-muted">
        Знайдено: {products.length} за запитом «{query}»
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

async function Content(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = (typeof q === "string" ? q : "").replace(/\s+/g, " ").trim().slice(0, 60);

  return (
    <>
      <form action="/search" role="search" className="flex max-w-[640px]">
        <label htmlFor="q" className="sr-only">Пошук товарів</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          autoFocus={!query}
          autoComplete="off"
          placeholder="Що шукаєте?"
          className="h-12 min-w-0 flex-1 rounded-l-[4px] border border-line bg-white px-4 text-[15px]"
        />
        <button
          type="submit"
          aria-label="Шукати"
          className="grid h-12 w-14 place-items-center rounded-r-[4px] bg-red text-white"
        >
          <Search size={20} />
        </button>
      </form>
      <Results query={query} />
    </>
  );
}

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <h1 className="text-[32px] md:text-[44px]">Пошук</h1>
        <div className="mt-6">
          <Suspense fallback={<div className="h-[200px]" aria-hidden />}>
            <Content {...props} />
          </Suspense>
        </div>
        <div className="mt-10">
          <CategoryTabs />
        </div>
      </section>
    </SiteShell>
  );
}
