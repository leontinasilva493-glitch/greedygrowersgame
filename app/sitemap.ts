import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPageIndexability } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const CONTENT_UPDATED = new Date("2026-07-26T00:00:00.000Z");
const ROUTES = [
  "/",
  "/about",
  "/guides",
  "/guides/beginner-guide",
  "/guides/when-to-harvest",
  "/seeds",
  "/seeds/compare",
  "/lightning",
  "/updates",
  "/data-status",
  "/codes",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getIndexabilitySnapshot();
  return ROUTES.filter(
    (route) => getPageIndexability(route, snapshot).includeInSitemap,
  ).map((route) => ({
    url: new URL(route, siteConfig.origin).toString(),
    lastModified: CONTENT_UPDATED,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
