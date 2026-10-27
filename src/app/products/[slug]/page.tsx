import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { DeliveryPayment } from "@/components/product/DeliveryPayment";
import { ExpandableText } from "@/components/product/ExpandableText";
import { SiteShell } from "@/components/SiteShell";
import { getCategory } from "@/lib/categories";
import { formatUah } from "@/lib/format";
import { getArticleForProduct } from "@/lib/articles";
import { liqpayConfigured } from "@/lib/liqpay";
import { getProductBySlug, getVariants } from "@/lib/products";
import { richTextToHtml } from "@/lib/rich-text";

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
  const descriptionHtml = richTextToHtml(product.description);
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

      <div className="mt-6 grid gap-x-14 gap-y-8 md:grid-cols-2">
        <div className="md:col-start-1">
          <ProductGallery
            images={product.images.length > 0 ? product.images : product.image_url ? [product.image_url] : []}
            alt={product.name}
            badge={product.badge}
          />
        </div>

        <div className="md:col-start-2 md:row-span-3 md:row-start-1 md:self-start md:pt-4">
          {category && (
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">
              {category.eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-[32px] leading-tight md:text-[40px]">{product.name}</h1>
          {product.tagline && <p className="mt-2 text-[15px] text-muted">{product.tagline}</p>}

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

          {product.colors.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Доступні кольори">
              {product.colors.map((c) => (
                <li key={c} className="size-6 rounded-full border border-line" style={{ backgroundColor: c }} />
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-start gap-x-6 gap-y-3">
            <p className="pt-2.5 text-[26px] font-medium leading-none sm:text-[28px]">{formatUah(product.price_uah)}</p>
            <AddToCartButton product={product} variant="inline" />
          </div>

          <DeliveryPayment onlineEnabled={liqpayConfigured()} />

          {guide && (
            <p className="mt-6 text-[14px]">
              Як обрати —{" "}
              <Link href={`/blog/${guide.slug}`} className="text-red underline underline-offset-4">
                читайте в блозі: {guide.title}
              </Link>
            </p>
          )}
        </div>

        {descriptionHtml && (
          <section className="md:col-start-1" aria-labelledby="product-description-title">
            <h2 id="product-description-title" className="text-[24px] md:text-[28px]">Опис</h2>
            <div className="mt-4">
              <ExpandableText html={descriptionHtml} />
            </div>
          </section>
        )}

        {product.specs.length > 0 && (
          <section className="md:col-start-1" aria-labelledby="product-specs-title">
            <h2 id="product-specs-title" className="text-[24px] md:text-[28px]">Характеристики</h2>
            <table className="mt-4 w-full border-collapse text-[14px] leading-normal">
              <tbody>
                {product.specs.map((row, i) => (
                  <tr key={`${row.name}-${i}`} className={i % 2 === 0 ? "bg-white" : ""}>
                    <th scope="row" className="w-[42%] border-b border-line px-4 py-3 text-left font-medium align-top">
                      {row.name}
                    </th>
                    <td className="border-b border-line px-4 py-3 align-top">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
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
