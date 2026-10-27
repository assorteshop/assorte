import sanitizeHtml from "sanitize-html";

// Product descriptions: only bold, italic, underline, line breaks, paragraphs and lists.
// No attributes at all, so no links, styles or scripts can get through.

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li"],
  allowedAttributes: {},
  parseStyleAttributes: false,
  transformTags: {
    b: "strong",
    i: "em",
    div: "p",
  },
};

export const sanitizeRichText = (html: string) => sanitizeHtml(html, OPTIONS).trim();

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Older descriptions are plain text with line breaks; new ones are HTML from the editor.
export function richTextToHtml(value: string | null | undefined): string {
  const text = (value ?? "").trim();
  if (!text) return "";
  if (/<(p|br|strong|b|em|i|u|ul|ol|li|div)\b/i.test(text)) return sanitizeRichText(text);
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export const plainTextOf = (html: string) =>
  html
    .replace(/<\/(p|li)>|<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
