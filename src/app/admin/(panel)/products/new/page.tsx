import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/supabase-server";

export default async function NewProduct(props: PageProps<"/admin/products/new">) {
  const { supabase } = await requireAdmin();
  const { from } = await props.searchParams;

  // "Add variant": copy the shared fields of an existing product.
  let prefill;
  if (typeof from === "string" && from) {
    const { data } = await supabase
      .from("products")
      .select("name, tagline, description, category, badge, colors, article, sort_order")
      .eq("id", from)
      .maybeSingle();
    if (data) prefill = data;
  }

  return (
    <>
      <h1 className="text-[28px]">{prefill ? "Новий варіант товару" : "Новий товар"}</h1>
      {prefill && (
        <p className="mt-2 text-[13px] text-muted">
          Спільні поля скопійовано. Вкажіть варіант, ціну та фото.
        </p>
      )}
      <ProductForm prefill={prefill} />
    </>
  );
}
