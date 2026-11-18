// Temporary (from 18.11.2026): photos are resized and compressed by the free wsrv.nl service
// instead of Vercel, because the Vercel Hobby plan ran out of image optimizations for the month
// (photos failed with «402 Payment required»). After moving to Vercel Pro (planned 1.12.2026),
// remove `loader` and `loaderFile` from next.config.ts and delete this file to use Vercel again.
// wsrv.nl fetches the original once, caches it on Cloudflare and serves a small WebP.

type LoaderProps = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality }: LoaderProps): string {
  // Files from /public are already small WebP: serve them as they are.
  if (src.startsWith("/")) return `${src}?w=${width}`;
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
    output: "webp",
    we: "", // never enlarge beyond the original
  });
  return `https://wsrv.nl/?${params.toString()}`;
}
