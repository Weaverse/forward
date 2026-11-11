import type { MetadataRoute } from "next";

import { siteBaseUrl } from "@/lib/routes/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/cart", "/search"],
      },
    ],
    sitemap: `${siteBaseUrl()}/sitemap.xml`,
  };
}
