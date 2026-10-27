"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { saveBanner, type FormState } from "@/app/admin/actions";
import { uploadImage } from "@/lib/upload";

export type BannerRow = {
  slot: number;
  eyebrow: string;
  title: string;
  body: string | null;
  button_label: string;
  href: string;
  image_url: string | null;
  tone: string;
  is_active: boolean;
  article_id?: string | null;
};

export type ArticleOption = { id: string; title: string; is_published: boolean };

export type LinkOption = { href: string; label: string; group: string };

const initial: FormState = { error: null };
const field = "mt-1.5 w-full rounded-[4px] border border-line bg-white px-4 text-[14px] h-11";
const label = "block text-[13px]";
const CUSTOM = "__custom";

export function BannerForm({
  banner,
  options,
  articles,
}: {
  banner: BannerRow;
  options: LinkOption[];
  articles: ArticleOption[];
}) {
  const [articleId, setArticleId] = useState(banner.article_id ?? "");
  const linked = articles.find((a) => a.id === articleId);
  const [state, action, pending] = useActionState(saveBanner, initial);
  const known = options.some((o) => o.href === banner.href);
  const [choice, setChoice] = useState(known ? banner.href : CUSTOM);
  const [custom, setCustom] = useState(known ? "" : banner.href);
  const [image, setImage] = useState(banner.image_url ?? "");
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const href = choice === CUSTOM ? custom : choice;
  const groups = [...new Set(options.map((o) => o.group))];

  const onImage = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setBusy(true);
    setUploadError("");
    try {
      setImage(await uploadImage(files[0], `banners/slot-${banner.slot}`));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Помилка завантаження.");
    }
    setBusy(false);
  };

  return (
    <form action={action} onSubmit={() => setSubmitted(true)} className="rounded-[6px] bg-white p-5">
      <input type="hidden" name="slot" value={banner.slot} />
      <input type="hidden" name="image_url" value={image} />
      <input type="hidden" name="href" value={href} />
      <input type="hidden" name="article_id" value={articleId} />

      <h2 className="text-[17px]">Блок {banner.slot}</h2>
      <label className={`${label} mt-4 max-w-[560px]`}>
        Що показує блок
        <select value={articleId} onChange={(e) => setArticleId(e.target.value)} className={field}>
          <option value="">Власний текст і посилання</option>
          {articles.map((a) => (
            <option key={a.id} value={a.id}>
              Стаття: {a.title}{a.is_published ? "" : " (чернетка)"}
            </option>
          ))}
        </select>
      </label>
      {articleId && (
        <p className={`mt-2 max-w-[640px] text-[12px] ${linked && !linked.is_published ? "text-red" : "text-muted"}`}>
          {linked && !linked.is_published
            ? "Увага: стаття не опублікована. На головній блок буде без кнопки, доки ви її не опублікуєте."
            : "Заголовок, анонс і фото беруться зі статті автоматично. Кнопка веде на статтю."}
        </p>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className={label}>
          Малий надпис над заголовком
          <input name="eyebrow" defaultValue={banner.eyebrow} maxLength={80} className={field} />
        </label>
        {!articleId && (
          <>
            <label className={label}>
              Заголовок
              <input name="title" required defaultValue={banner.title} maxLength={120} className={field} />
            </label>
            <label className={`${label} md:col-span-2`}>
              Додатковий рядок (необовʼязково)
              <input name="body" defaultValue={banner.body ?? ""} maxLength={200} className={field} />
            </label>
          </>
        )}
        <label className={label}>
          Текст кнопки
          <input
            key={articleId ? "article" : "own"}
            name="button_label"
            required
            defaultValue={articleId && !banner.article_id ? "Читати далі" : banner.button_label}
            maxLength={30}
            className={field}
          />
        </label>
        {!articleId && (
        <label className={label}>
          Куди веде кнопка
          <select value={choice} onChange={(e) => setChoice(e.target.value)} className={field}>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {options.filter((o) => o.group === g).map((o) => (
                  <option key={o.href} value={o.href}>{o.label}</option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM}>Інша адреса…</option>
          </select>
        </label>
        )}
        {!articleId && choice === CUSTOM && (
          <label className={`${label} md:col-span-2`}>
            Адреса (починається з / або https://)
            <input value={custom} onChange={(e) => setCustom(e.target.value)} className={field} />
          </label>
        )}
        <label className={label}>
          Колір блоку
          <select name="tone" defaultValue={banner.tone} className={field}>
            <option value="light">Світлий</option>
            <option value="red">Червоний</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-[14px] md:pt-7">
          <input type="checkbox" name="is_active" defaultChecked={banner.is_active} className="size-4 accent-[#b60016]" />
          Показувати на головній
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {image && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-20 w-32 rounded-[4px] border border-line object-cover" />
            <button type="button" aria-label="Прибрати фото" onClick={() => setImage("")} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white shadow-sm">
              <X size={14} />
            </button>
          </div>
        )}
        <label className="cursor-pointer rounded-[4px] border border-graphite px-4 py-2.5 text-[13px]">
          {busy ? "Завантажуємо…" : image ? "Замінити фото" : "+ Фото на тлі блоку"}
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => { onImage(e.target.files); e.target.value = ""; }} className="sr-only" />
        </label>
      </div>
      <p role="alert" className="mt-2 min-h-5 text-[13px] text-red">{uploadError || state.error}</p>

      <div className="mt-2 flex items-center gap-4">
        <button type="submit" disabled={pending || busy} className="rounded-[4px] bg-red px-6 py-3 text-[14px] font-medium text-white disabled:opacity-60">
          {pending ? "Зберігаємо…" : "Зберегти"}
        </button>
        {submitted && !pending && !state.error && <span className="text-[13px] text-[#1f6b34]">Збережено ✓</span>}
      </div>
    </form>
  );
}
