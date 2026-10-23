import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { getNewProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Новинки — ASSORTE" };

async function Grid() {
  const products = await getNewProducts();
  if (products.length === 0) {
    return <p className="py-16 text-muted">Новинки скоро з’являться.</p>;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default function NewPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">Assorte</p>
        <h1 className="mt-2 text-[32px] md:text-[44px]">Новинки</h1>
        <div className="mt-8">
          <Suspense fallback={<div className="h-[420px]" aria-hidden />}>
            <Grid />
          </Suspense>
        </div>
      </section>
    </SiteShell>
  );
}
