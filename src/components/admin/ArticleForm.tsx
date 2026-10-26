"use client";

import { useActionState, useRef, useState } from "react";
import { X } from "lucide-react";
import { saveArticle, type FormState } from "@/app/admin/actions";
import { Markdown } from "@/components/Markdown";
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
};

export type ProductOption = { slug: string; name: string; variant_label: string | null };

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

export function ArticleForm({ article, products }: { article?: Article; products: ProductOption[] }) {
  const [state, action, pending] = useActionState(saveArticle, initial);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [body, setBody] = useState(article?.body ?? "");
  const [cover, setCover] = useState(article?.cover_url ?? "");
  const [related, setRelated] = useState<string[]>(article?.related_slugs ?? []);
  const [preview, setPreview] = useState(false);
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
        setBody((prev) => `${prev.slice(0, pos)}\n\n![](${url})\n\n${prev.slice(pos)}`);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Помилка завантаження.");
    }
    setBusy(false);
  };

  const toggle = (s: string) =>
    setRelated((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 12)));

  return (
    <form action={action} className="mt-6 space-y-8">
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="cover_url" value={cover} />
      <input type="hidden" name="related" value={JSON.stringify(related)} />

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
              setSlug(e.target.value.toLowerCase());
            }}
            className={field}
          />
          <span className="mt-1 block text-[12px] text-muted">/articles/{slug || "…"}</span>
        </label>
        <label className={`${label} md:col-span-2`}>
          Короткий анонс (до 300 символів, показується в списку статей)
          <textarea name="excerpt" rows={3} maxLength={300} defaultValue={article?.excerpt ?? ""} className={`${field} h-auto py-3`} />
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
          onChange={(e) => setBody(e.target.value)}
          className={`mt-3 w-full rounded-[4px] border border-line bg-white p-4 font-mono text-[14px] leading-relaxed ${preview ? "hidden" : ""}`}
        />
        {preview && (
          <div className="mt-3 rounded-[4px] border border-line bg-white p-6">
            {body.trim() ? <Markdown>{body}</Markdown> : <p className="text-muted">Поки порожньо.</p>}
          </div>
        )}
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          Підказка: <code>## Підзаголовок</code>, <code>**жирний**</code>, список через <code>- пункт</code>,
          посилання <code>[текст](https://…)</code>. Фото в текст вставляє кнопка нижче: воно з’явиться там, де стоїть курсор.
        </p>
        <label className="mt-3 inline-block cursor-pointer rounded-[4px] border border-graphite px-5 py-3 text-[14px]">
          {busy ? "Завантажуємо…" : "+ Вставити фото в текст"}
          <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { onInsertImage(e.target.files); e.target.value = ""; }} className="sr-only" />
        </label>
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
