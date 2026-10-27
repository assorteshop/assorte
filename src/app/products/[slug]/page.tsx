import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { SiteShell } from "@/components/SiteShell";
import { getCategory } from "@/lib/categories";
import { formatUah } from "@/lib/format";
import { getArticleForProduct } from "@/lib/articles";
import { getProductBySlug, getVariants } from "@/lib/products";

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
  const [variants, guide] = await Promise.all([getVariants(product.article), getArticleForProduct(product.id)]);

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
          {variants.length > 1 && (
            <div className="mt-6">
              <p className="text-[13px] text-muted">Варіант</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/products/${v.slug}`}
                      aria-current={v.slug === product.slug ? "page" : undefined}
                      className={`inline-block rounded-full border px-4 py-2 text-[14px] ${
                        v.slug === product.slug
                          ? "border-graphite bg-graphite text-white"
                          : "border-line bg-white hover:border-graphite"
                      }`}
                    >
                      {v.variant_label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

          <AddToCartButton product={product} variant="full" />

          {guide && (
            <p className="mt-6 text-[14px]">
              Як обрати —{" "}
              <Link href={`/blog/${guide.slug}`} className="text-red underline underline-offset-4">
                читайте в блозі: {guide.title}
              </Link>
            </p>
          )}
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
