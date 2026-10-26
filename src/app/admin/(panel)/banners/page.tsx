import { BannerForm, type BannerRow, type LinkOption } from "@/components/admin/BannerForm";
import { categories } from "@/lib/categories";
import { defaultBanners } from "@/lib/articles";
import { requireAdmin } from "@/lib/supabase-server";

export default async function AdminBanners() {
  const { supabase } = await requireAdmin();

  const [{ data: rows }, { data: articles }, { data: products }] = await Promise.all([
    supabase.from("home_banners").select("*").order("slot"),
    supabase.from("articles").select("slug, title").eq("is_published", true).order("published_at", { ascending: false }),
    supabase.from("products").select("slug, name, variant_label").eq("is_published", true).order("name").limit(150),
  ]);

  const banners: BannerRow[] = [1, 2, 3].map((slot) => {
    const found = rows?.find((r) => r.slot === slot);
    if (found) return found as BannerRow;
    const d = defaultBanners.find((b) => b.slot === slot)!;
    return { ...d, is_active: true };
  });

  const options: LinkOption[] = [
    { href: "/catalog", label: "Каталог", group: "Сторінки" },
    { href: "/articles", label: "Усі статті", group: "Сторінки" },
    ...categories.map((c) => ({ href: `/catalog/${c.slug}`, label: c.name, group: "Категорії" })),
    ...(articles ?? []).map((a) => ({ href: `/articles/${a.slug}`, label: a.title, group: "Статті" })),
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
          <BannerForm key={`${b.slot}-${b.title}-${b.href}`} banner={b} options={options} />
        ))}
      </div>
    </>
  );
}
