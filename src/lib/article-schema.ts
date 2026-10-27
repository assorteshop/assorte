import { z } from "zod";
import { categories } from "./categories";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categorySlugs = categories.map((c) => c.slug) as [string, ...string[]];

// Empty text from a form means "not set".
const optional = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v === "" ? null : v));

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((u) => u === "" || u.startsWith("https://") || u.startsWith("/"), "Некоректне посилання на зображення.")
  .transform((v) => (v === "" ? null : v));

export const articleSchema = z
  .object({
    title: z.string().trim().min(1, "Вкажіть заголовок.").max(200, "Заголовок: до 200 символів."),
    slug: z
      .string()
      .trim()
      .max(80, "Адреса сторінки: до 80 символів.")
      .regex(slugPattern, "Адреса сторінки: лише малі латинські літери, цифри та дефіси."),
    excerpt: z.string().trim().max(300, "Короткий анонс: до 300 символів."),
    body: z.string().max(150_000, "Текст задовгий."),
    seo_title: optional(60, "SEO-заголовок: до 60 символів."),
    meta_description: optional(160, "Опис для Google: до 160 символів."),
    title_accent: optional(200, "Частина заголовка червоним: до 200 символів."),
    eyebrow: optional(60, "Надпис над заголовком: до 60 символів."),
    category_slug: z
      .string()
      .trim()
      .refine((v) => v === "" || categorySlugs.includes(v), "Оберіть категорію зі списку.")
      .transform((v) => (v === "" ? null : v)),
    cover_url: imageUrl,
    cover_alt: optional(200, "Опис обкладинки: до 200 символів."),
    faq: z
      .array(
        z.object({
          q: z.string().trim().min(1, "Питання не може бути порожнім.").max(200, "Питання: до 200 символів."),
          a: z.string().trim().min(1, "Відповідь не може бути порожньою.").max(2000, "Відповідь: до 2000 символів."),
        }),
      )
      .max(12, "Питань може бути до 12."),
    sources: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Назва джерела не може бути порожньою.").max(120, "Назва джерела: до 120 символів."),
          url: z
            .string()
            .trim()
            .max(500)
            .refine((u) => {
              try {
                const p = new URL(u).protocol;
                return p === "https:" || p === "http:";
              } catch {
                return false;
              }
            }, "Посилання на джерело має бути повною адресою (https://…)."),
        }),
      )
      .max(12, "Джерел може бути до 12."),
    primary_product_id: z
      .string()
      .trim()
      .refine((v) => v === "" || z.string().uuid().safeParse(v).success, "Некоректний головний товар.")
      .transform((v) => (v === "" ? null : v)),
    target_query: optional(120, "Цільовий запит: до 120 символів."),
    related: z.array(z.string().regex(slugPattern)).max(12, "Товарів зі статті може бути до 12."),
    is_published: z.boolean(),
  })
  .superRefine((a, ctx) => {
    if (a.title_accent && !a.title.includes(a.title_accent)) {
      ctx.addIssue({
        code: "custom",
        path: ["title_accent"],
        message: "Частина заголовка червоним має входити в заголовок дослівно.",
      });
    }
    if (a.cover_url && !a.cover_alt) {
      ctx.addIssue({
        code: "custom",
        path: ["cover_alt"],
        message: "Додайте опис обкладинки (alt): він потрібен для доступності та Google.",
      });
    }
  });

export type ArticleInput = z.infer<typeof articleSchema>;

const json = (value: FormDataEntryValue | null, fallback: unknown) => {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return Symbol.for("invalid-json");
  }
};

// Reads the raw FormData of the admin form and validates it on the server.
export function parseArticleForm(
  formData: FormData,
): { ok: true; data: ArticleInput } | { ok: false; error: string } {
  const text = (key: string) => String(formData.get(key) ?? "");
  const faq = json(formData.get("faq"), []);
  const sources = json(formData.get("sources"), []);
  const related = json(formData.get("related"), []);
  if ([faq, sources, related].some((v) => typeof v === "symbol")) {
    return { ok: false, error: "Не вдалося прочитати дані форми. Оновіть сторінку й спробуйте ще раз." };
  }

  const result = articleSchema.safeParse({
    title: text("title"),
    slug: text("slug"),
    excerpt: text("excerpt"),
    body: text("body"),
    seo_title: text("seo_title"),
    meta_description: text("meta_description"),
    title_accent: text("title_accent"),
    eyebrow: text("eyebrow"),
    category_slug: text("category_slug"),
    cover_url: text("cover_url"),
    cover_alt: text("cover_alt"),
    faq,
    sources,
    primary_product_id: text("primary_product_id"),
    target_query: text("target_query"),
    related,
    is_published: formData.get("is_published") === "on",
  });

  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Перевірте поля форми." };
  }
  return { ok: true, data: result.data };
}
