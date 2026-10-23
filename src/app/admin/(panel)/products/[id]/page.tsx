import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/supabase-server";
import { deleteProduct } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function EditProduct(props: PageProps<"/admin/products/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await props.params;
  const { data: product } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!product) notFound();

  return (
    <>
      <h1 className="text-[28px]">{product.name}</h1>
      <ProductForm product={product} />
      <form action={deleteProduct} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={product.id} />
        <DeleteButton />
      </form>
    </>
  );
}
