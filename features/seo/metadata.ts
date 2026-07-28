import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

import {
  getPageIndexability,
  metadataRobots,
  type IndexabilitySnapshot,
} from "./indexability";

export function createGatedMetadata({
  title,
  description,
  canonical,
  route,
  snapshot,
  socialImage,
}: {
  title: string;
  description: string;
  canonical: string;
  route: string;
  snapshot: IndexabilitySnapshot;
  socialImage?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
}): Metadata {
  const gate = getPageIndexability(route, snapshot);

  const socialMetadata = socialImage
    ? {
        openGraph: {
          type: "website" as const,
          siteName: siteConfig.name,
          locale: "en_US",
          url: canonical,
          title,
          description,
          images: [socialImage],
        },
        twitter: {
          card: "summary_large_image" as const,
          title,
          description,
          images: [socialImage.url],
        },
      }
    : {};

  return {
    title,
    description,
    alternates: { canonical },
    robots: metadataRobots(gate),
    ...socialMetadata,
  };
}
