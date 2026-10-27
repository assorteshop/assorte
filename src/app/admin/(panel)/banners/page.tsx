import { BannerForm, type BannerRow, type LinkOption } from "@/components/admin/BannerForm";
import { categories } from "@/lib/categories";
import { defaultBanners } from "@/lib/articles";
import { requireAdmin } from "@/lib/supabase-server";

export default async function AdminBanners() {
  const { supabase } = await requireAdmin();

  const [{ data: rows }, { data: articles }, { data: products }] = await Promise.all([
    supabase.from("home_banners").select("*").order("slot"),
    supabase.from("articles").select("id, slug, title, is_published").order("created_at", { ascending: false }),
    supabase.from("products").select("slug, name, variant_label").eq("is_published", true).order("name").limit(150),
  ]);

  const banners: BannerRow[] = [1, 2, 3].map((slot) => {
    const found = rows?.find((r) => r.slot === slot);
    if (found) return found as BannerRow;
    const d = defaultBanners.find((b) => b.slot === slot)!;
    return { ...d, href: d.href ?? "/catalog", is_active: true, article_id: null };
  });

  const options: LinkOption[] = [
    { href: "/catalog", label: "Каталог", group: "Сторінки" },
    { href: "/blog", label: "Блог", group: "Сторінки" },
    ...categories.map((c) => ({ href: `/catalog/${c.slug}`, label: c.name, group: "Категорії" })),
    ...(articles ?? []).filter((a) => a.is_published).map((a) => ({ href: `/blog/${a.slug}`, label: a.title, group: "Статті" })),
    ...(products ?? []).map((p) => ({
      href: `/products/${p.slug}`,
      label: p.name + (p.variant_label ? ` — ${p.variant_label}` : ""),
      group: "Товари",
    })),
  ];

  return (
    <>
      <h1 className="text-[28px]">Блоки на головній</h1>
      <p className="mt-2 max-w-[640px] text-[13px] leading-relaxed text-muted">
        Три великі блоки внизу головної сторінки. Кнопку кожного можна направити на статтю, категорію або товар.
        Фото на тлі необовʼязкове: без нього блок залишається однотонним.
      </p>
      <div className="mt-6 space-y-5">
        {banners.map((b) => (
          <BannerForm key={`${b.slot}-${b.title}-${b.href}-${b.article_id ?? ""}`} banner={b} options={options} articles={(articles ?? []).map((a) => ({ id: a.id, title: a.title, is_published: a.is_published }))} />
        ))}
      </div>
    </>
  );
}
