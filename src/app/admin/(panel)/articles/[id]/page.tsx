import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteArticle } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase-server";

export default async function EditArticle(props: PageProps<"/admin/articles/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await props.params;
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!article) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("slug, name, variant_label")
    .eq("is_published", true)
    .order("name");

  return (
    <>
      <h1 className="text-[28px]">{article.title}</h1>
      <ArticleForm article={article} products={products ?? []} />
      <form action={deleteArticle} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={article.id} />
        <DeleteButton label="Видалити статтю" message="Видалити цю статтю назавжди?" />
      </form>
    </>
  );
}
