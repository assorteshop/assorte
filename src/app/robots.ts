import type { MetadataRoute } from "next";
import { isIndexingEnabled } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/cart", "/checkout", "/search"],
    },
  };
}
