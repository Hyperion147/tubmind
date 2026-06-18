import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/listings", "/ideas/"],
        disallow: ["/admin", "/dashboard", "/login", "/auth/", "/api/"],
      },
    ],
    sitemap: `${siteUrl.toString().replace(/\/$/, "")}/sitemap.xml`,
    host: siteUrl.toString().replace(/\/$/, ""),
  };
}
