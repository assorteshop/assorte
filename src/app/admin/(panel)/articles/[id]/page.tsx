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

  const { data: note } = await supabase
    .from("article_private")
    .select("target_query")
    .eq("article_id", id)
    .maybeSingle();

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, variant_label, price_uah, is_published")
    .eq("is_published", true)
    .order("name");

  return (
    <>
      <h1 className="text-[28px]">{article.title}</h1>
      <ArticleForm article={{ ...article, target_query: note?.target_query ?? null }} products={products ?? []} />
      <form action={deleteArticle} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="id" value={article.id} />
        <DeleteButton label="Видалити статтю" message="Видалити цю статтю назавжди?" />
      </form>
    </>
  );
}
