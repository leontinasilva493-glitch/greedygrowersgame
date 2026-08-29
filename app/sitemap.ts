import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const CONTENT_UPDATED = new Date("2026-07-26T00:00:00.000Z");
const ROUTE_LAST_MODIFIED = new Map<string, Date>([
  ["/guides", new Date("2026-08-02T00:00:00.000Z")],
  ["/guides/beginner-guide", new Date("2026-08-02T00:00:00.000Z")],
  ["/guides/when-to-harvest", new Date("2026-08-02T00:00:00.000Z")],
  ["/guides/mutations", new Date("2026-08-04T00:00:00.000Z")],
  ["/guides/how-to-make-money", new Date("2026-08-25T00:00:00.000Z")],
  ["/guides/prediction-potion", new Date("2026-08-25T00:00:00.000Z")],
  ["/guides/how-to-get-tickets", new Date("2026-08-25T00:00:00.000Z")],
  ["/guides/rebirth", new Date("2026-08-25T00:00:00.000Z")],
  ["/pets", new Date("2026-08-25T00:00:00.000Z")],
  ["/guides/how-to-grow-big-trees", new Date("2026-08-28T00:00:00.000Z")],
  ["/guides/fertilizer", new Date("2026-08-28T00:00:00.000Z")],
  ["/guides/worms", new Date("2026-08-28T00:00:00.000Z")],
  ["/guides/farmers-market", new Date("2026-08-29T00:00:00.000Z")],
  ["/guides/seed-feeding-chair", new Date("2026-08-29T00:00:00.000Z")],
]);
const ROUTES = [
  "/",
  "/about",
  "/guides",
  "/guides/beginner-guide",
  "/guides/when-to-harvest",
  "/guides/mutations",
  "/guides/how-to-make-money",
  "/guides/prediction-potion",
  "/guides/how-to-get-tickets",
  "/guides/rebirth",
  "/guides/how-to-grow-big-trees",
  "/guides/fertilizer",
  "/guides/worms",
  "/guides/farmers-market",
  "/guides/seed-feeding-chair",
  "/pets",
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
        : ROUTE_LAST_MODIFIED.get(route) ?? CONTENT_UPDATED),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
