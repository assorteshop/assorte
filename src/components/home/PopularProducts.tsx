import { getFeaturedProducts } from "@/lib/products";
import { PopularCarousel } from "./PopularCarousel";
import { ProductCard } from "./ProductCard";

export async function PopularProducts() {
  const products = await getFeaturedProducts(12);

  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <h2 className="text-[28px] md:text-[36px]">Популярні товари</h2>
        <p className="mt-6 text-muted">Товари скоро з’являться.</p>
      </section>
    );
  }

  return (
    <PopularCarousel>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </PopularCarousel>
  );
}
