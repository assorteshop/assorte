import sanitizeHtml from "sanitize-html";

// Articles are written in Claude chat and pasted into the admin as-is.
// Two formats are accepted: the styled HTML Claude produces (see docs/reference) or Markdown.

export const isHtmlArticle = (body: string) => /<(article|h1|h2|p|div|table|figure)\b/i.test(body);

const PLACEHOLDER = /ВСТАВТЕ/;

// Old category addresses used in briefs -> the real catalogue.
const categoryAliases: Record<string, string> = {
  "tech-gadgets": "tech",
  "sport-active": "sport",
  "gifts-discoveries": "gifts",
  "style-comfort": "style",
};

export function rewriteHref(href: string): string {
  const m = href.match(/^\/category\/([a-z0-9-]+)\/?$/);
  if (!m) return href;
  return `/catalog/${categoryAliases[m[1]] ?? m[1]}`;
}

// Inline font names from Claude ('Manrope', 'Inter', 'Caveat') -> the site's own loaded fonts.
function mapFonts(html: string) {
  return html.replace(/font-family\s*:\s*([^;"]*)/gi, (_m, value: string) => {
    if (/manrope/i.test(value)) return "font-family:var(--font-manrope), Arial, sans-serif";
    if (/caveat|segoe script|cursive/i.test(value)) return "font-family:var(--font-script), cursive";
    return "font-family:var(--font-inter), Arial, sans-serif";
  });
}

const safeValue = /^(?!.*(url\s*\(|expression|javascript:|@import|behavior)).{0,240}$/i;
const styleProps = [
  "color", "background", "background-color", "border", "border-top", "border-bottom", "border-left",
  "border-right", "border-radius", "border-collapse", "border-color", "border-width", "border-style",
  "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
  "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
  "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing",
  "text-align", "text-transform", "text-decoration", "white-space", "word-break",
  "display", "flex", "flex-wrap", "flex-direction", "gap", "align-items", "justify-content",
  "width", "max-width", "min-width", "height", "overflow-x", "vertical-align",
  "list-style", "list-style-type",
];
const allowedProps = new Set(styleProps);

// Keeps only whitelisted CSS properties with safe values. Done by hand on purpose: the
// sanitizer's own CSS parser uses Math.random(), which Next.js forbids while prerendering.
export function filterStyle(style: string): string {
  return style
    .split(";")
    .map((decl) => {
      const i = decl.indexOf(":");
      if (i < 0) return null;
      const prop = decl.slice(0, i).trim().toLowerCase();
      const value = decl.slice(i + 1).trim();
      return allowedProps.has(prop) && value && safeValue.test(value) ? `${prop}:${value}` : null;
    })
    .filter(Boolean)
    .join(";");
}

function withStyle(attribs: Record<string, string>) {
  if (attribs.style === undefined) return attribs;
  const style = filterStyle(attribs.style);
  const next = { ...attribs };
  if (style) next.style = style;
  else delete next.style;
  return next;
}

/**
 * Cleans pasted HTML so it is safe to show to visitors: no scripts, iframes, event handlers,
 * javascript: links or external CSS. Unfilled "ФОТО" placeholders are removed for visitors
 * and kept (as a visible box) in the admin preview.
 */
export function cleanArticleHtml(html: string, opts: { keepPlaceholders?: boolean } = {}) {
  let src = html;
  if (!opts.keepPlaceholders) {
    src = src.replace(/<figure\b[^>]*>(?:(?!<\/figure>)[\s\S])*?ВСТАВТЕ(?:(?!<\/figure>)[\s\S])*?<\/figure>/g, "");
  }
  src = mapFonts(src);

  return sanitizeHtml(src, {
    allowedTags: [
      "article", "section", "header", "footer", "div", "span", "p", "br", "hr",
      "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "mark", "small", "sup", "sub",
      "ul", "ol", "li", "blockquote", "figure", "figcaption", "img", "a",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "code", "pre",
    ],
    allowedAttributes: {
      "*": ["style"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "title"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    parseStyleAttributes: false,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => frame.tag === "img" && (!frame.attribs.src || PLACEHOLDER.test(frame.attribs.src)),
    transformTags: {
      "*": (tagName, attribs) => {
        const a = withStyle(attribs);
        if (tagName === "a") {
          const href = rewriteHref(a.href ?? "");
          const external = /^https?:\/\//i.test(href);
          return {
            tagName,
            attribs: { ...a, href, ...(external ? { target: "_blank", rel: "nofollow noopener noreferrer" } : {}) },
          };
        }
        if (tagName === "img") return { tagName, attribs: { loading: "lazy", ...a } };
        return { tagName, attribs: a };
      },
    },
  });
}

// ---------- reading information out of the article ----------

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'");

export const textOf = (html: string) => decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

export type ArticleMeta = {
  h1: string | null;
  accent: string | null;
  eyebrow: string | null;
  lead: string | null;
  firstImage: string | null;
  hasSignature: boolean;
  faq: { q: string; a: string }[];
  seo: { slug: string | null; title: string | null; description: string | null };
  readingMinutes: number;
};

export function readArticle(body: string): ArticleMeta {
  const html = isHtmlArticle(body);
  const words = textOf(body).split(" ").filter(Boolean).length;
  const meta: ArticleMeta = {
    h1: null,
    accent: null,
    eyebrow: null,
    lead: null,
    firstImage: null,
    hasSignature: /Більше, ніж просто речі/.test(body),
    faq: [],
    seo: { slug: null, title: null, description: null },
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };

  const seoComment = body.match(/<!--((?:(?!-->)[\s\S])*SEO(?:(?!-->)[\s\S])*)-->/);
  if (seoComment) {
    const line = (label: string) =>
      seoComment[1].match(new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, "mi"))?.[1].trim() ?? null;
    const url = line("URL");
    meta.seo = {
      slug: url ? url.split("/").filter(Boolean).pop() ?? null : null,
      title: line("Title"),
      description: line("Meta description"),
    };
  }

  if (!html) return meta;

  const h1 = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    meta.h1 = textOf(h1[1]);
    const accent = h1[1].match(/<span\b[^>]*>([\s\S]*?)<\/span>/i);
    meta.accent = accent ? textOf(accent[1]) : null;
    const before = body.slice(0, h1.index);
    const eyebrow = [...before.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].pop();
    meta.eyebrow = eyebrow ? textOf(eyebrow[1]) : null;
    const after = body.slice((h1.index ?? 0) + h1[0].length);
    const lead = after.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    meta.lead = lead ? textOf(lead[1]) : null;
  }

  const img = [...body.matchAll(/<img\b[^>]*src="(https:\/\/[^"]+)"/gi)].find((m) => !PLACEHOLDER.test(m[1]));
  meta.firstImage = img ? img[1] : null;

  const faqStart = body.search(/<h2\b[^>]*>[^<]*(Часті запитання|FAQ)[^<]*<\/h2>/i);
  if (faqStart >= 0) {
    const rest = body.slice(faqStart).replace(/^<h2\b[\s\S]*?<\/h2>/i, "");
    const end = rest.search(/<h2\b|<div\b/i);
    const section = end >= 0 ? rest.slice(0, end) : rest;
    meta.faq = [...section.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => ({
      q: textOf(m[1]),
      a: textOf(m[2]),
    }));
  }
  return meta;
}

// ---------- photo placeholders ("ФОТО 1 ...") in Claude's HTML ----------

const SLOT = /<div\b[^>]*dashed[^>]*>((?:(?!<\/div>)[\s\S])*?)<!--\s*(<img\b[^>]*>)\s*-->\s*<\/div>/g;

export type PhotoSlot = { index: number; label: string; alt: string };

export function listPhotoSlots(body: string): PhotoSlot[] {
  return [...body.matchAll(SLOT)].map((m, index) => ({
    index,
    label: textOf(m[1].split(/<br\s*\/?>/i)[0] ?? "") || `Фото ${index + 1}`,
    alt: m[2].match(/alt="([^"]*)"/)?.[1] ?? "",
  }));
}

export function fillPhotoSlot(body: string, index: number, url: string): string {
  let i = -1;
  return body.replace(SLOT, (whole, _inner, img: string) => {
    i += 1;
    if (i !== index) return whole;
    return img.replace(/src="[^"]*"/, `src="${url.replace(/"/g, "%22")}"`);
  });
}

// ---------- product cards inside the text: a line [[product:slug]] ----------

export type BodyPart = { type: "content"; value: string } | { type: "product"; slug: string };

export function splitProductMarkers(body: string): BodyPart[] {
  const parts: BodyPart[] = [];
  const re = /(?:<p\b[^>]*>\s*)?\[\[product:([a-z0-9-]+)\]\](?:\s*<\/p>)?/g;
  let last = 0;
  for (const m of body.matchAll(re)) {
    if (m.index! > last) parts.push({ type: "content", value: body.slice(last, m.index) });
    parts.push({ type: "product", slug: m[1] });
    last = m.index! + m[0].length;
  }
  if (last < body.length) parts.push({ type: "content", value: body.slice(last) });
  return parts;
}

export const productSlugsIn = (body: string) =>
  splitProductMarkers(body).flatMap((p) => (p.type === "product" ? [p.slug] : []));
