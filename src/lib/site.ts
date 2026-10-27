// One source of truth for the public address of the site and for search-engine access.
// The development address (*.vercel.app) is closed to indexing; the real domain is
// opened by setting NEXT_PUBLIC_SITE_URL to it in Vercel (Production only).

const DEFAULT_SITE_URL = "https://assorte.vercel.app";

export function getSiteUrl(env: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string {
  if (!env) return DEFAULT_SITE_URL;
  try {
    const url = new URL(env);
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function isIndexingEnabled(
  env: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): boolean {
  if (!env) return false;
  if (vercelEnv === "preview" || vercelEnv === "development") return false;
  try {
    const url = new URL(env);
    return (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      !url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}
