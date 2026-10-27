import type { NextConfig } from "next";
import { getSiteUrl, isIndexingEnabled } from "./src/lib/site";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  // Not the real domain yet: ask every crawler to stay away (also covers files and API routes).
  // The blog used to live at /articles. Once the real domain is set, the old technical
  // address (assorte.vercel.app) sends everybody to the real one, keeping the path.
  async redirects() {
    return [
      ...(isIndexingEnabled()
        ? [
            {
              source: "/:path*",
              has: [{ type: "host" as const, value: "assorte.vercel.app" }],
              destination: `${getSiteUrl()}/:path*`,
              statusCode: 301,
            },
          ]
        : []),
      { source: "/articles", destination: "/blog", statusCode: 301 },
      { source: "/articles/:slug", destination: "/blog/:slug", statusCode: 301 },
    ];
  },
  async headers() {
    return isIndexingEnabled()
      ? []
      : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
