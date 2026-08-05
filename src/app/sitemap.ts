import type { MetadataRoute } from "next";

import { CANONICAL_ROUTES } from "@/lib/routes/route-contract";
import { SITE_BASE_URL } from "@/lib/routes/site";

const INDEXABLE_CATEGORIES = new Set(["storefront", "commerce", "editorial"]);

export default function sitemap(): MetadataRoute.Sitemap {
  // Only static, indexable patterns belong here; dynamic entries are added
  // once live handles exist.
  return CANONICAL_ROUTES.filter(
    (route) =>
      !route.pattern.includes("[") &&
      INDEXABLE_CATEGORIES.has(route.category) &&
      route.pattern !== "/cart" &&
      route.pattern !== "/search",
  ).map((route) => ({
    url: `${SITE_BASE_URL}${route.pattern === "/" ? "" : route.pattern}`,
    changeFrequency: "weekly",
    priority: route.pattern === "/" ? 1 : 0.7,
  }));
}
