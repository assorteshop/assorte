// Google Analytics 4 and the first-touch source of each order.
// GA loads only on the real domain (the same switch as indexing) and never in /admin.
// No personal data (name, phone, email, address) is ever sent to GA.

import { z } from "zod";
import { isIndexingEnabled } from "@/lib/site";

const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

export function getGaId(env: string | undefined = process.env.NEXT_PUBLIC_GA_ID): string | null {
  const id = env?.trim();
  return id && GA_ID_PATTERN.test(id) ? id : null;
}

/** The GA id to load, or null when GA must stay off (preview, *.vercel.app, local, no id). */
export function activeGaId(
  gaEnv: string | undefined = process.env.NEXT_PUBLIC_GA_ID,
  siteEnv: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): string | null {
  return isIndexingEnabled(siteEnv, vercelEnv) ? getGaId(gaEnv) : null;
}

// ---------- First touch: where the visitor came from the first time ----------

export const FIRST_TOUCH_KEY = "assorte-first-touch-v1";
export const FIRST_TOUCH_DAYS = 30;

const short = (max: number) => z.string().trim().max(max);

export const firstTouchSchema = z.object({
  source: short(100).min(1),
  medium: short(100).optional(),
  campaign: short(150).optional(),
  landing: short(300).optional(),
  at: z.iso.datetime(),
});

export type FirstTouch = z.infer<typeof firstTouchSchema>;

const clip = (s: string | null | undefined, max: number) => {
  const v = (s ?? "").trim();
  return v ? v.slice(0, max) : undefined;
};

// Search engines are named the way Google Analytics names them: "google / organic".
const SEARCH_ENGINES: [string, RegExp][] = [
  ["google", /^google\.[a-z.]+$/],
  ["bing", /^bing\.com$/],
  ["yahoo", /^(search\.)?yahoo\.com$/],
  ["duckduckgo", /^duckduckgo\.com$/],
  ["yandex", /^yandex\.[a-z.]+$/],
  ["ecosia", /^ecosia\.org$/],
  ["baidu", /^baidu\.com$/],
];

/** The search engine for a hostname (www is ignored), or null. mail.google.com and the like are not search. */
export function searchEngine(host: string): string | null {
  const h = host.toLowerCase().replace(/^www\./, "");
  return SEARCH_ENGINES.find(([, re]) => re.test(h))?.[0] ?? null;
}

/** Source and medium named like GA4: (direct) / (none), google / organic, t.me / referral, x / (not set). */
export function gaSourceMedium(source: string, medium?: string): { source: string; medium: string } {
  if (source === "direct" && !medium) return { source: "(direct)", medium: "(none)" };
  // Orders saved before search engines were recognised: google.com / referral -> google / organic.
  if (medium === "referral") {
    const engine = searchEngine(source);
    if (engine) return { source: engine, medium: "organic" };
  }
  return { source, medium: medium || "(not set)" };
}

/**
 * Works out the first-touch source from the landing URL and document.referrer.
 * Order: utm_* tags, then the referring domain (other than our own), then "direct".
 */
export function detectFirstTouch(input: { href: string; referrer: string; now?: Date }): FirstTouch {
  const at = (input.now ?? new Date()).toISOString();
  let url: URL | null = null;
  try {
    url = new URL(input.href);
  } catch {
    url = null;
  }
  const landing = url ? clip(url.pathname, 300) : undefined;

  const utmSource = clip(url?.searchParams.get("utm_source"), 100);
  if (utmSource) {
    return {
      source: utmSource.toLowerCase(),
      medium: clip(url?.searchParams.get("utm_medium"), 100)?.toLowerCase(),
      campaign: clip(url?.searchParams.get("utm_campaign"), 150),
      landing,
      at,
    };
  }

  let refHost = "";
  try {
    refHost = input.referrer ? new URL(input.referrer).hostname.toLowerCase() : "";
  } catch {
    refHost = "";
  }
  const ownHost = url?.hostname.toLowerCase().replace(/^www\./, "") ?? "";
  const ref = refHost.replace(/^www\./, "");
  if (ref && ref !== ownHost) {
    const engine = searchEngine(ref);
    if (engine) return { source: engine, medium: "organic", landing, at };
    return { source: ref.slice(0, 100), medium: "referral", landing, at };
  }
  return { source: "direct", landing, at };
}

/** A stored first touch is used only while it is valid and younger than FIRST_TOUCH_DAYS. */
export function parseStoredFirstTouch(raw: string | null, now: Date = new Date()): FirstTouch | null {
  if (!raw) return null;
  try {
    const parsed = firstTouchSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const age = now.getTime() - new Date(parsed.data.at).getTime();
    return age >= 0 && age <= FIRST_TOUCH_DAYS * 86_400_000 ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Server side: the first touch sent with the order form, or null if missing or invalid. */
export function parseFirstTouchField(raw: string): FirstTouch | null {
  if (!raw || raw.length > 2000) return null;
  try {
    const parsed = firstTouchSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Short label for the admin, named like GA4: "google / organic · /blog/…", "(direct) / (none) · /". */
export function firstTouchLabel(ft: unknown): string | null {
  const parsed = firstTouchSchema.safeParse(ft);
  if (!parsed.success) return null;
  const { campaign, landing } = parsed.data;
  const named = gaSourceMedium(parsed.data.source, parsed.data.medium);
  return [`${named.source} / ${named.medium}`, campaign, landing].filter(Boolean).join(" · ");
}

/** Where an add-to-cart click happened, from the page path. */
export function cartSource(pathname: string): string {
  const article = pathname.match(/^\/blog\/([^/?#]+)/);
  if (article) return `article:${article[1]}`.slice(0, 100);
  if (pathname.startsWith("/products/")) return "product";
  if (pathname === "/") return "home";
  return pathname.split("/")[1]?.slice(0, 40) || "home";
}

// ---------- Sending events (browser only, silent when GA is not loaded) ----------

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

export type GaItem = { item_id: string; item_name: string; price: number; quantity: number };

export function track(event: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const w = window as GtagWindow;
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("event", event, params);
  } catch {
    // Analytics must never break the shop.
  }
}

/** purchase is sent once per order number, even if the page is re-rendered or restored. */
export function trackPurchaseOnce(orderNumber: number, value: number, items: GaItem[]): void {
  if (typeof window === "undefined") return;
  const key = `assorte-ga-purchase-${orderNumber}`;
  try {
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
  } catch {
    // Without storage we still send it once for this render.
  }
  track("purchase", { transaction_id: String(orderNumber), currency: "UAH", value, items });
}
