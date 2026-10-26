import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";

export default async function AdminArticles() {
  const { supabase } = await requireAdmin();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, is_published, published_at, cover_url")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px]">Статті</h1>
        <Link href="/admin/articles/new" className="rounded-[4px] bg-red px-5 py-3 text-[14px] font-medium text-white">
          + Нова стаття
        </Link>
      </div>
      {!articles?.length ? (
        <p className="mt-8 text-muted">Статей ще немає.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-[6px] bg-white">
          {articles.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/articles/${a.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-ivory">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.cover_url ? <img src={a.cover_url} alt="" className="h-14 w-20 rounded-[4px] object-cover" /> : <span className="h-14 w-20 rounded-[4px] bg-ivory" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px]">{a.title}</span>
                  <span className="block text-[12px] text-muted">/articles/{a.slug}</span>
                </span>
                <span className={`rounded-full px-3 py-1 text-[11px] ${a.is_published ? "bg-[#e3f1e6] text-[#1f6b34]" : "bg-[#f1e3e3] text-red"}`}>
                  {a.is_published ? "Опубліковано" : "Чернетка"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
