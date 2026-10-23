import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/supabase-server";

export default async function NewProduct() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-[28px]">Новий товар</h1>
      <ProductForm />
    </>
  );
}
