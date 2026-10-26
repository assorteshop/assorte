import Link from "next/link";
import { getCategory } from "@/lib/categories";
import { formatUah } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";

export default async function AdminProducts() {
  const { supabase } = await requireAdmin();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price_uah, category, is_published, is_featured, image_url, article, variant_label")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px]">Товари</h1>
        <Link
          href="/admin/products/new"
          className="rounded-[4px] bg-red px-5 py-3 text-[14px] font-medium text-white"
        >
          + Додати товар
        </Link>
      </div>

      {!products?.length ? (
        <p className="mt-8 text-muted">Товарів ще немає.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-[6px] bg-white">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/products/${p.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-ivory"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="size-14 rounded-[4px] bg-ivory object-contain" />
                ) : (
                  <span className="size-14 rounded-[4px] bg-ivory" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px]">
                    {p.name}
                    {p.variant_label && <span className="text-muted"> — {p.variant_label}</span>}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {(p.category && getCategory(p.category)?.name) ?? "Без категорії"} · {formatUah(p.price_uah)}{p.article ? ` · арт. ${p.article}` : ""}
                  </span>
                </span>
                {p.is_featured && (
                  <span className="hidden rounded-full bg-ivory px-3 py-1 text-[11px] sm:inline">На головній</span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-[11px] ${
                    p.is_published ? "bg-[#e3f1e6] text-[#1f6b34]" : "bg-[#f1e3e3] text-red"
                  }`}
                >
                  {p.is_published ? "Опубліковано" : "Чернетка"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
