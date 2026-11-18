import { describe, expect, it } from "vitest";
import imageLoader from "./image-loader";

describe("image loader (wsrv.nl)", () => {
  it("sends Supabase photos through wsrv.nl as WebP of the asked width", () => {
    const src = "https://x.supabase.co/storage/v1/object/public/products/a/b c.png";
    const url = new URL(imageLoader({ src, width: 640 }));
    expect(url.origin).toBe("https://wsrv.nl");
    expect(url.searchParams.get("url")).toBe(src);
    expect(url.searchParams.get("w")).toBe("640");
    expect(url.searchParams.get("q")).toBe("75");
    expect(url.searchParams.get("output")).toBe("webp");
    expect(url.searchParams.has("we")).toBe(true);
  });
  it("keeps the site's own files on the site", () => {
    expect(imageLoader({ src: "/images/home/alex-picks.webp", width: 828, quality: 80 })).toBe(
      "/images/home/alex-picks.webp?w=828",
    );
  });
});
