import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export async function PopularProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">
        Вибір Assorte
      </p>
      <div className="mt-2 flex items-end justify-between">
        <h2 className="text-[32px] md:text-[36px]">Популярні товари</h2>
        <Link href="/catalog" className="inline-flex items-center gap-2 text-[13px] hover:text-red">
          Усі товари <ArrowRight size={14} />
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-muted">Товари скоро з’являться.</p>
      )}
    </section>
  );
}
