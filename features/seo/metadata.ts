import type { Metadata } from "next";

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
}: {
  title: string;
  description: string;
  canonical: string;
  route: string;
  snapshot: IndexabilitySnapshot;
}): Metadata {
  const gate = getPageIndexability(route, snapshot);

  return {
    title,
    description,
    alternates: { canonical },
    robots: metadataRobots(gate),
  };
}
