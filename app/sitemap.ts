import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { dataRepository } from "@/features/data/repository";
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
  const [snapshot, indexableSeeds, gameVersion, codes, updates] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getIndexableSeeds(),
    dataRepository.getCurrentGameVersion(),
    dataRepository.getCodes(),
    dataRepository.getUpdates(),
  ]);
  const routes = [
    ...ROUTES,
    ...indexableSeeds.map((seed) => `/seeds/${seed.slug}` as const),
  ];
  const seedByRoute = new Map(
    indexableSeeds.map((seed) => [`/seeds/${seed.slug}`, seed.lastVerified]),
  );
  const latestUpdate = updates
    .map((update) => update.publishedAt)
    .sort()
    .at(-1);

  return routes.filter(
    (route) => getPageIndexability(route, snapshot).includeInSitemap,
  ).map((route) => ({
    url: new URL(route, siteConfig.origin).toString(),
    lastModified:
      seedByRoute.get(route) ??
      (route === "/codes" ? codes.lastChecked : undefined) ??
      (route === "/updates" ? latestUpdate : undefined) ??
      (["/seeds", "/seeds/compare", "/lightning", "/data-status"].includes(route)
        ? gameVersion.checkedAt
        : CONTENT_UPDATED),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
