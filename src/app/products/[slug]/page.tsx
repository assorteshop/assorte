import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { SiteShell } from "@/components/SiteShell";
import { getCategory } from "@/lib/categories";
import { formatUah, getProductBySlug } from "@/lib/products";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const product = await getProductBySlug((await props.params).slug);
  return { title: product ? `${product.name} — ASSORTE` : "Товар — ASSORTE" };
}

async function Content(props: PageProps<"/products/[slug]">) {
  const product = await getProductBySlug((await props.params).slug);
  if (!product) notFound();
  const category = product.category ? getCategory(product.category) : undefined;

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <nav aria-label="Навігація" className="text-[12px] text-muted">
        <Link href="/catalog" className="hover:text-red">Каталог</Link>
        {category && (
          <>
            {" / "}
            <Link href={`/catalog/${category.slug}`} className="hover:text-red">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-14">
        <ProductGallery
          images={product.images.length > 0 ? product.images : product.image_url ? [product.image_url] : []}
          alt={product.name}
          badge={product.badge}
        />

        <div className="md:pt-4">
          {category && (
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">
              {category.eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-[32px] leading-tight md:text-[40px]">{product.name}</h1>
          <p className="mt-2 text-[15px] text-muted">{product.tagline}</p>
          <p className="mt-6 text-[28px] font-medium">{formatUah(product.price_uah)}</p>

          {product.colors.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Доступні кольори">
              {product.colors.map((c) => (
                <li
                  key={c}
                  className="size-6 rounded-full border border-line"
                  style={{ backgroundColor: c }}
                />
              ))}
            </ul>
          )}

          {product.description && (
            <p className="mt-6 max-w-[480px] text-[15px] leading-relaxed">{product.description}</p>
          )}

          <button
            type="button"
            disabled
            className="mt-8 w-full rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white opacity-60 md:w-auto"
          >
            Оформлення замовлень — скоро
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <SiteShell>
      <Suspense fallback={<div className="h-[600px]" aria-hidden />}>
        <Content {...props} />
      </Suspense>
    </SiteShell>
  );
}
