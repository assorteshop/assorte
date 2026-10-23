"use client";

import { useActionState, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { saveProduct, type FormState } from "@/app/admin/actions";
import { categories } from "@/lib/categories";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price_uah: number;
  badge: string | null;
  category: string | null;
  colors: string[] | null;
  images: string[] | null;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

const initial: FormState = { error: null };
const field = "mt-1.5 w-full rounded-[4px] border border-line bg-white px-4 text-[14px] h-12";
const label = "block text-[13px]";

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z", и: "y",
  і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s",
  т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu",
  я: "ia", ы: "y", э: "e", ё: "e", ъ: "",
};

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState(saveProduct, initial);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [images, setImages] = useState<string[]>(
    product?.images?.length ? product.images : product?.image_url ? [product.image_url] : [],
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(toSlug(v));
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");
    const supabase = createSupabaseBrowser();
    const folder = /^[a-z0-9-]+$/.test(slug) && slug ? slug : "misc";

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Можна завантажувати лише зображення.");
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUploadError("Фото більше 8 МБ. Зменште його й спробуйте ще раз.");
        continue;
      }
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("products")
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (error) {
        setUploadError(`Не вдалося завантажити: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setImages((prev) => [...prev, data.publicUrl]);
    }
    setUploading(false);
  };

  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form action={action} className="mt-6 space-y-8">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className={`${label} md:col-span-2`}>
          Назва
          <input name="name" required value={name} onChange={(e) => onName(e.target.value)} className={field} />
        </label>
        <label className={label}>
          Адреса сторінки (латиницею)
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            className={field}
          />
          <span className="mt-1 block text-[12px] text-muted">/products/{slug || "…"}</span>
        </label>
        <label className={label}>
          Категорія
          <select name="category" required defaultValue={product?.category ?? ""} className={field}>
            <option value="" disabled>Оберіть…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Ціна, грн
          <input name="price_uah" type="number" min={0} step={1} required defaultValue={product?.price_uah ?? ""} className={field} />
        </label>
        <label className={label}>
          Плашка на фото (необовʼязково)
          <input name="badge" defaultValue={product?.badge ?? ""} maxLength={30} placeholder="Наприклад: Новинка" className={field} />
        </label>
        <label className={`${label} md:col-span-2`}>
          Короткий опис під назвою
          <input name="tagline" defaultValue={product?.tagline ?? ""} maxLength={200} className={field} />
        </label>
        <label className={`${label} md:col-span-2`}>
          Повний опис
          <textarea name="description" rows={6} defaultValue={product?.description ?? ""} className={`${field} h-auto py-3`} />
        </label>
        <label className={label}>
          Кольори (необовʼязково)
          <input name="colors" defaultValue={product?.colors?.join(", ") ?? ""} placeholder="#171717, #e9e1d6" className={field} />
        </label>
        <label className={label}>
          Порядок (менше — вище)
          <input name="sort_order" type="number" step={1} defaultValue={product?.sort_order ?? 100} className={field} />
        </label>
      </div>

      <fieldset>
        <legend className="text-[15px]">Фото</legend>
        <p className="mt-1 text-[12px] text-muted">Перше фото головне. Квадратні фото на білому тлі виглядають найкраще.</p>
        <ul className="mt-3 flex flex-wrap gap-3">
          {images.map((src, i) => (
            <li key={src} className="w-28">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-28 rounded-[4px] border border-line bg-white object-contain" />
                <button
                  type="button"
                  aria-label="Видалити фото"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white shadow-sm"
                >
                  <X size={14} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-red px-2 py-0.5 text-[10px] text-white">Головне</span>
                )}
              </div>
              <div className="mt-1 flex justify-center gap-2">
                <button type="button" aria-label="Лівіше" disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" aria-label="Правіше" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="disabled:opacity-30">
                  <ChevronRight size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <label className="mt-4 inline-block cursor-pointer rounded-[4px] border border-graphite px-5 py-3 text-[14px]">
          {uploading ? "Завантажуємо…" : "+ Завантажити фото"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
        <p role="alert" className="mt-2 min-h-5 text-[13px] text-red">{uploadError}</p>
      </fieldset>

      <fieldset className="space-y-3">
        <label className="flex items-center gap-3 text-[14px]">
          <input type="checkbox" name="is_published" defaultChecked={product?.is_published ?? true} className="size-4 accent-[#b60016]" />
          Опубліковано (видно на сайті)
        </label>
        <label className="flex items-center gap-3 text-[14px]">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} className="size-4 accent-[#b60016]" />
          Показувати у слайдері «Популярні товари» на головній
        </label>
      </fieldset>

      <div>
        <p role="alert" className="min-h-5 text-[13px] text-red">{state.error}</p>
        <button
          type="submit"
          disabled={pending || uploading}
          className="mt-2 rounded-[4px] bg-red px-8 py-4 text-[15px] font-medium text-white disabled:opacity-60"
        >
          {pending ? "Зберігаємо…" : "Зберегти"}
        </button>
      </div>
    </form>
  );
}
