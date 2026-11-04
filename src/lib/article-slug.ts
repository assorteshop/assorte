// The article address (slug) taken from whatever was pasted: "/blog/abc", a full link, "abc.", "/articles/abc/".
// The result has only latin letters, digits and hyphens.

const SLASH_LOOKALIKES = /\\|⁄|∕|／|&#0*47;|&#x0*2f;|&sol;/gi;

/** Slug from a pasted address: no domain, no /blog/ or /articles/, no slashes, spaces, quotes or trailing dot. */
export function slugFromUrl(raw: string): string {
  let v = raw.trim().toLowerCase().replace(SLASH_LOOKALIKES, "/");
  v = v.split(/\s/)[0] ?? ""; // an address has no spaces: ignore a note written after it
  v = v.split(/[?#]/)[0] ?? "";
  v = v.replace(/^(?:[a-z][a-z0-9+.-]*:)?\/\/[^/]*/, ""); // https://host
  v = v.replace(/^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?=\/)/, ""); // host/ without https://
  const last = v.split("/").filter(Boolean).pop() ?? ""; // /blog/abc and /articles/abc both end in abc
  return last
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** For the address field while typing: keeps a hyphen at the end, but cleans a pasted link or path. */
export function cleanSlugInput(typed: string): string {
  const v = typed.toLowerCase().replace(SLASH_LOOKALIKES, "/");
  if (v.includes("/")) return slugFromUrl(v);
  return v
    .replace(/\.+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-");
}
