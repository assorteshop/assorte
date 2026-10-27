"use client";

import { useActionState, useRef, useState } from "react";
import { X } from "lucide-react";
import { saveArticle, type FormState } from "@/app/admin/actions";
import { categories } from "@/lib/categories";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { fillPhotoSlot, isHtmlArticle, listPhotoSlots, looksGarbled, readArticle } from "@/lib/article-html";
import { uploadImage } from "@/lib/upload";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  related_slugs: string[] | null;
  is_published: boolean;
  seo_title?: string | null;
  meta_description?: string | null;
  title_accent?: string | null;
  eyebrow?: string | null;
  category_slug?: string | null;
  cover_alt?: string | null;
  faq?: { q: string; a: string }[] | null;
  sources?: { label: string; url: string }[] | null;
  primary_product_id?: string | null;
  target_query?: string | null;
};

export type ProductOption = {
  id: string;
  slug: string;
  name: string;
  variant_label: string | null;
  price_uah?: number;
  is_published?: boolean;
};

function Counter({ value, max, min }: { value: number; max: number; min?: number }) {
  const over = value > max;
  const good = !over && value > 0 && (min === undefined || value >= min);
  return (
    <span className={`mt-1 block text-[12px] ${over ? "text-red" : good ? "text-[#1f6b34]" : "text-muted"}`}>
      {value} / {max}
      {min !== undefined && value > 0 && value < min ? ` · краще від ${min}` : ""}
    </span>
  );
}

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
  name.toLowerCase().split("").map((ch) => translit[ch] ?? ch).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// Whatever is typed into the address field becomes latin letters, digits and hyphens.
const normalizeSlug = (v: string) =>
  v
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-");

const trimSlug = (v: string) => v.replace(/^-+|-+$/g, "");

export function ArticleForm({ article, products }: { article?: Article; products: ProductOption[] }) {
  const [state, action, pending] = useActionState(saveArticle, initial);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [body, setBody] = useState(article?.body ?? "");
  const [cover, setCover] = useState(article?.cover_url ?? "");
  const [related, setRelated] = useState<string[]>(article?.related_slugs ?? []);
  const [preview, setPreview] = useState(false);
  const [seoTitle, setSeoTitle] = useState(article?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(article?.meta_description ?? "");
  const [coverAlt, setCoverAlt] = useState(article?.cover_alt ?? "");
  const [faq, setFaq] = useState<{ q: string; a: string }[]>(article?.faq ?? []);
  const [sources, setSources] = useState<{ label: string; url: string }[]>(article?.sources ?? []);
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [eyebrow, setEyebrow] = useState(article?.eyebrow ?? "");
  const [titleAccent, setTitleAccent] = useState(article?.title_accent ?? "");
  const [filledFromPaste, setFilledFromPaste] = useState<string[]>([]);
  const [productToInsert, setProductToInsert] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const folder = () => `articles/${/^[a-z0-9-]+$/.test(slug) && slug ? slug : "misc"}`;

  const onCover = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setBusy(true);
    setUploadError("");
    try {
      setCover(await uploadImage(files[0], folder()));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Помилка завантаження.");
    }
    setBusy(false);
  };

  const onInsertImage = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setUploadError("");
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, folder());
        const el = bodyRef.current;
        const pos = el?.selectionStart ?? body.length;
        const tag = isHtmlArticle(body)
          ? `<figure style="margin:0 0 32px;"><img src="${url}" alt="" style="width:100%;height:auto;border-radius:16px;display:block;"></figure>`
          : `![](${url})`;
        setBody((prev) => `${prev.slice(0, pos)}\n\n${tag}\n\n${prev.slice(pos)}`);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Помилка завантаження.");
    }
    setBusy(false);
  };

  // Pasting a whole article from Claude fills the empty fields from it.
  const onBodyChange = (value: string) => {
    const pasted = value.length - body.length > 1500;
    setBody(value);
    if (!pasted || !isHtmlArticle(value)) return;
    const m = readArticle(value);
    const filled: string[] = [];
    if (!title && m.h1) { setTitle(m.h1); filled.push("заголовок"); }
    if (!slugTouched && m.seo.slug) { setSlug(normalizeSlug(m.seo.slug)); setSlugTouched(true); filled.push("адресу"); }
    else if (!slug && m.h1) { setSlug(toSlug(m.h1)); filled.push("адресу"); }
    if (!excerpt && m.lead) { setExcerpt(m.lead.slice(0, 300)); filled.push("анонс"); }
    if (!seoTitle && m.seo.title) { setSeoTitle(m.seo.title); filled.push("SEO-заголовок"); }
    if (!metaDescription && m.seo.description) { setMetaDescription(m.seo.description); filled.push("опис для Google"); }
    if (!eyebrow && m.eyebrow) { setEyebrow(m.eyebrow.slice(0, 60)); filled.push("надпис над заголовком"); }
    if (!titleAccent && m.accent) { setTitleAccent(m.accent); filled.push("червону частину заголовка"); }
    setFilledFromPaste(filled);
  };

  const insertAtCursor = (text: string) => {
    const pos = bodyRef.current?.selectionStart ?? body.length;
    setBody((prev) => `${prev.slice(0, pos)}\n\n${text}\n\n${prev.slice(pos)}`);
  };

  const slots = listPhotoSlots(body);
  const onSlotPhoto = async (index: number, files: FileList | null) => {
    if (!files?.[0]) return;
    setBusy(true);
    setUploadError("");
    try {
      const url = await uploadImage(files[0], folder());
      setBody((prev) => fillPhotoSlot(prev, index, url));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Помилка завантаження.");
    }
    setBusy(false);
  };

  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  const toggle = (s: string) =>
    setRelated((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 12)));

  return (
    <form action={action} className="mt-6 space-y-8">
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="cover_url" value={cover} />
      <input type="hidden" name="related" value={JSON.stringify(related)} />
      <input type="hidden" name="faq" value={JSON.stringify(faq)} />
      <input type="hidden" name="sources" value={JSON.stringify(sources)} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className={`${label} md:col-span-2`}>
          Заголовок
          <input
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(toSlug(e.target.value));
            }}
            className={field}
          />
        </label>
        <label className={`${label} md:col-span-2`}>
          Адреса сторінки (латиницею)
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(normalizeSlug(e.target.value));
            }}
            onBlur={() => setSlug((v) => trimSlug(v))}
            className={field}
          />
          <span className="mt-1 block text-[12px] text-muted">/blog/{slug || "…"}</span>
        </label>
        <label className={`${label} md:col-span-2`}>
          Короткий анонс (до 300 символів, показується в списку статей)
          <textarea name="excerpt" rows={3} maxLength={300} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={`${field} h-auto py-3`} />
        </label>
        <label className={label}>
          Надпис над заголовком
          <input name="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} maxLength={60} placeholder="Гід ASSORTE · Техніка та гаджети" className={field} />
        </label>
        <label className={label}>
          Частина заголовка червоним
          <input name="title_accent" value={titleAccent} onChange={(e) => setTitleAccent(e.target.value)} maxLength={200} placeholder="Має входити в заголовок дослівно" className={field} />
        </label>
        <label className={label}>
          Категорія статті
          <select name="category_slug" defaultValue={article?.category_slug ?? ""} className={field}>
            <option value="">Без категорії</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Головний товар статті
          <select name="primary_product_id" defaultValue={article?.primary_product_id ?? ""} className={field}>
            <option value="">Не вибрано</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.variant_label ? ` — ${p.variant_label}` : ""}</option>
            ))}
          </select>
        </label>
        <label className={`${label} md:col-span-2`}>
          SEO-заголовок (для Google; якщо порожньо, береться заголовок)
          <input name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={field} />
          <Counter value={seoTitle.length} max={60} />
        </label>
        <label className={`${label} md:col-span-2`}>
          Опис для Google (якщо порожньо, береться короткий анонс)
          <textarea name="meta_description" rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={`${field} h-auto py-3`} />
          <Counter value={metaDescription.length} max={160} min={120} />
        </label>
        <label className={`${label} md:col-span-2`}>
          Цільовий запит (нотатка для себе, на сайті не показується)
          <input name="target_query" defaultValue={article?.target_query ?? ""} maxLength={120} placeholder="як вибрати павербанк" className={field} />
        </label>
      </div>

      <fieldset>
        <legend className="text-[15px]">Обкладинка</legend>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {cover && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" className="h-28 w-44 rounded-[4px] border border-line object-cover" />
              <button
                type="button"
                aria-label="Прибрати обкладинку"
                onClick={() => setCover("")}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <label className="cursor-pointer rounded-[4px] border border-graphite px-5 py-3 text-[14px]">
            {busy ? "Завантажуємо…" : cover ? "Замінити фото" : "+ Завантажити фото"}
            <input type="file" accept="image/*" disabled={busy} onChange={(e) => { onCover(e.target.files); e.target.value = ""; }} className="sr-only" />
          </label>
        </div>
        <label className="mt-3 block max-w-[560px] text-[13px]">
          Опис обкладинки (alt, обовʼязковий, якщо є фото)
          <input name="cover_alt" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} maxLength={200} className={field} />
        </label>
      </fieldset>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px]">Текст статті</p>
          <div className="flex gap-2 text-[13px]">
            <button type="button" onClick={() => setPreview(false)} className={`rounded-full border px-4 py-1.5 ${!preview ? "border-graphite bg-graphite text-white" : "border-line bg-white"}`}>
              Редактор
            </button>
            <button type="button" onClick={() => setPreview(true)} className={`rounded-full border px-4 py-1.5 ${preview ? "border-graphite bg-graphite text-white" : "border-line bg-white"}`}>
              Як виглядатиме
            </button>
          </div>
        </div>
        <textarea
          ref={bodyRef}
          name="body"
          rows={18}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Вставте сюди статтю з Claude (HTML як є) або текст у Markdown"
          className={`mt-3 w-full rounded-[4px] border border-line bg-white p-4 font-mono text-[14px] leading-relaxed ${preview ? "hidden" : ""}`}
        />
        {preview && (
          <div className="mt-3 rounded-[4px] border border-line bg-white p-6">
            {body.trim() ? (
              <div className="mx-auto max-w-[760px]">
                <ArticleBody
                  body={body}
                  preview
                  renderProduct={(s) => {
                    const p = productBySlug.get(s);
                    const ok = p && p.is_published !== false && (p.price_uah ?? 0) > 0;
                    return (
                      <div className={`my-8 max-w-[360px] rounded-[16px] border p-4 text-[14px] ${ok ? "border-line bg-ivory" : "border-[#e8c34a] bg-[#fff8db]"}`}>
                        {ok ? (
                          <>Картка товару: <strong>{p.name}</strong>{p.price_uah ? ` · ${p.price_uah} грн` : ""}</>
                        ) : (
                          <>Товар «{s}» недоступний: не знайдено, не опублікований або без ціни. На сайті картки не буде.</>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            ) : (
              <p className="text-muted">Поки порожньо.</p>
            )}
          </div>
        )}
        {looksGarbled(body) && (
          <p role="alert" className="mt-2 rounded-[4px] bg-[#fdecee] px-3 py-2 text-[13px] text-red">
            Текст схожий на пошкоджений: замість літер кракозябри (так буває, якщо копіювати зі сторінки браузера з неправильною
            кодуванням). Очистіть поле й вставте статтю заново з Claude chat (кнопка «Copy») або з файлу через текстовий редактор.
            Зберегти такий текст не вийде.
          </p>
        )}
        {filledFromPaste.length > 0 && (
          <p className="mt-2 rounded-[4px] bg-[#e3f1e6] px-3 py-2 text-[13px] text-[#1f6b34]">
            Заповнено зі статті: {filledFromPaste.join(", ")}. Перевірте поля вгорі.
          </p>
        )}

        {slots.length > 0 && (
          <div className="mt-4 rounded-[6px] border border-line bg-white p-4">
            <p className="text-[14px]">Фото для статті ({slots.length} ще не додано)</p>
            <ul className="mt-2 space-y-2">
              {slots.map((slot) => (
                <li key={`${slot.index}-${slot.label}`} className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
                  <span className="min-w-0 flex-1">{slot.label}</span>
                  <label className="cursor-pointer rounded-[4px] border border-graphite px-4 py-2 text-[13px]">
                    {busy ? "Завантажуємо…" : "Завантажити"}
                    <input type="file" accept="image/*" disabled={busy} onChange={(e) => { onSlotPhoto(slot.index, e.target.files); e.target.value = ""; }} className="sr-only" />
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] text-muted">Поки фото не додано, на сайті цих місць не видно.</p>
          </div>
        )}

        <p className="mt-3 text-[12px] leading-relaxed text-muted">
          Вставляйте статтю з Claude цілком (HTML як є) або пишіть у Markdown: <code>## Підзаголовок</code>,{" "}
          <code>**жирний**</code>, <code>- пункт</code>, таблиці. Картка товару в тексті: окремий рядок{" "}
          <code>[[product:адреса-товару]]</code>.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-block cursor-pointer rounded-[4px] border border-graphite px-5 py-3 text-[14px]">
            {busy ? "Завантажуємо…" : "+ Вставити фото в текст"}
            <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { onInsertImage(e.target.files); e.target.value = ""; }} className="sr-only" />
          </label>
          <select value={productToInsert} onChange={(e) => setProductToInsert(e.target.value)} className="h-12 max-w-[320px] rounded-[4px] border border-line bg-white px-3 text-[14px]" aria-label="Товар для картки в тексті">
            <option value="">Картка товару в текст…</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}{p.variant_label ? ` — ${p.variant_label}` : ""}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!productToInsert}
            onClick={() => { insertAtCursor(`[[product:${productToInsert}]]`); setProductToInsert(""); }}
            className="rounded-[4px] border border-graphite px-4 py-3 text-[14px] disabled:opacity-40"
          >
            Вставити
          </button>
        </div>
        <p role="alert" className="mt-2 min-h-5 text-[13px] text-red">{uploadError}</p>
      </div>

      <fieldset>
        <legend className="text-[15px]">Товари зі статті</legend>
        <p className="mt-1 text-[12px] text-muted">Відмічені товари з’являться карточками внизу статті (до 12).</p>
        <ul className="mt-3 grid max-h-64 gap-1 overflow-y-auto rounded-[4px] border border-line bg-white p-3 sm:grid-cols-2">
          {products.map((p) => (
            <li key={p.slug}>
              <label className="flex items-center gap-2 py-1 text-[13px]">
                <input type="checkbox" checked={related.includes(p.slug)} onChange={() => toggle(p.slug)} className="size-4 accent-[#b60016]" />
                <span className="truncate">{p.name}{p.variant_label ? ` — ${p.variant_label}` : ""}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="text-[15px]">Питання й відповіді (FAQ)</legend>
        <p className="mt-1 text-[12px] text-muted">Показуються в кінці статті та допомагають у Google. До 12 питань.</p>
        <ul className="mt-3 space-y-3">
          {faq.map((item, i) => (
            <li key={i} className="rounded-[4px] border border-line bg-white p-3">
              <input
                aria-label={`Питання ${i + 1}`}
                value={item.q}
                maxLength={200}
                placeholder="Питання"
                onChange={(e) => setFaq((prev) => prev.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
                className="h-11 w-full rounded-[4px] border border-line px-3 text-[14px]"
              />
              <textarea
                aria-label={`Відповідь ${i + 1}`}
                value={item.a}
                rows={3}
                maxLength={2000}
                placeholder="Відповідь"
                onChange={(e) => setFaq((prev) => prev.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
                className="mt-2 w-full rounded-[4px] border border-line p-3 text-[14px]"
              />
              <button type="button" onClick={() => setFaq((prev) => prev.filter((_, j) => j !== i))} className="mt-2 text-[12px] text-red underline underline-offset-4">
                Видалити питання
              </button>
            </li>
          ))}
        </ul>
        {faq.length < 12 && (
          <button type="button" onClick={() => setFaq((prev) => [...prev, { q: "", a: "" }])} className="mt-3 rounded-[4px] border border-graphite px-4 py-2.5 text-[13px]">
            + Додати питання
          </button>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-[15px]">Джерела</legend>
        <p className="mt-1 text-[12px] text-muted">Посилання на документи й матеріали, на які спирається стаття. До 12.</p>
        <ul className="mt-3 space-y-3">
          {sources.map((item, i) => (
            <li key={i} className="grid gap-2 rounded-[4px] border border-line bg-white p-3 md:grid-cols-[1fr_1.4fr_auto]">
              <input
                aria-label={`Назва джерела ${i + 1}`}
                value={item.label}
                maxLength={120}
                placeholder="Назва"
                onChange={(e) => setSources((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
              />
              <input
                aria-label={`Посилання ${i + 1}`}
                value={item.url}
                maxLength={500}
                placeholder="https://…"
                onChange={(e) => setSources((prev) => prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                className="h-11 rounded-[4px] border border-line px-3 text-[14px]"
              />
              <button type="button" onClick={() => setSources((prev) => prev.filter((_, j) => j !== i))} className="text-[12px] text-red underline underline-offset-4">
                Видалити
              </button>
            </li>
          ))}
        </ul>
        {sources.length < 12 && (
          <button type="button" onClick={() => setSources((prev) => [...prev, { label: "", url: "" }])} className="mt-3 rounded-[4px] border border-graphite px-4 py-2.5 text-[13px]">
            + Додати джерело
          </button>
        )}
      </fieldset>

      <label className="flex items-center gap-3 text-[14px]">
        <input type="checkbox" name="is_published" defaultChecked={article?.is_published ?? false} className="size-4 accent-[#b60016]" />
        Опубліковано (видно на сайті)
      </label>

      <div>
        <p role="alert" className="min-h-5 text-[13px] text-red">{state.error}</p>
        <button
          type="submit"
          disabled={pending || busy}
          className="mt-2 rounded-[4px] bg-red px-8 py-4 text-[15px] font-medium text-white disabled:opacity-60"
        >
          {pending ? "Зберігаємо…" : "Зберегти"}
        </button>
      </div>
    </form>
  );
}
