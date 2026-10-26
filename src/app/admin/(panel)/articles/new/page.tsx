import { ArticleForm } from "@/components/admin/ArticleForm";
import { requireAdmin } from "@/lib/supabase-server";

export default async function NewArticle() {
  const { supabase } = await requireAdmin();
  const { data: products } = await supabase
    .from("products")
    .select("slug, name, variant_label")
    .eq("is_published", true)
    .order("name");
  return (
    <>
      <h1 className="text-[28px]">Нова стаття</h1>
      <ArticleForm products={products ?? []} />
    </>
  );
}
