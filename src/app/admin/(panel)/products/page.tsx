import Link from "next/link";
import { ProductList } from "@/components/admin/ProductList";
import { type AdminProduct, filterFromParams } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/supabase-server";

export default async function AdminProducts(props: PageProps<"/admin/products">) {
  const { supabase } = await requireAdmin();
  const initial = filterFromParams(await props.searchParams);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price_uah, old_price_uah, category, audience, is_published, is_featured, image_url, images, article, variant_label, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px]">Товари</h1>
        <Link href="/admin/products/new" className="rounded-[4px] bg-red px-5 py-3 text-[14px] font-medium text-white">
          + Додати товар
        </Link>
      </div>

      {!products?.length ? (
        <p className="mt-8 text-muted">Товарів ще немає.</p>
      ) : (
        <ProductList products={products as AdminProduct[]} initial={initial} />
      )}
    </>
  );
}
