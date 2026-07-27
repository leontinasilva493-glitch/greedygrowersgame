import { describe, expect, it } from "vitest";

import { getEffectiveStatus, isSeedIndexable } from "./eligibility";
import type { Seed, Source } from "./types";

const currentVersion = "2026-07-27";
const sources: Source[] = [
  {
    id: "source-image",
    type: "gameplay",
    title: "Image evidence",
    url: "https://example.com/image",
    capturedAt: "2026-07-27T00:00:00.000Z",
    gameVersion: currentVersion,
  },
  ...[1, 2, 3].map((index) => ({
    id: `source-fact-${index}`,
    type: "gameplay" as const,
    title: `Fact evidence ${index}`,
    url: `https://example.com/fact-${index}`,
    capturedAt: "2026-07-27T00:00:00.000Z",
    gameVersion: currentVersion,
  })),
];

const validSeed: Seed = {
  id: "river-seed",
  slug: "river-seed",
  name: "River Seed",
  imageUrl: "https://example.com/seed.webp",
  imageSourceId: "source-image",
  acquisition: "River",
  facts: [1, 2, 3].map((index) => ({
    key: `fact-${index}`,
    value: `Fact ${index}`,
    sourceIds: [`source-fact-${index}`],
  })),
  status: "verified",
  gameVersion: currentVersion,
  lastVerified: "2026-07-27T00:00:00.000Z",
  sourceIds: ["source-image", "source-fact-1", "source-fact-2", "source-fact-3"],
  indexing: "index",
  indexingReason: "Three unique sourced facts",
};

describe("seed eligibility", () => {
  it("indexes a current factual seed without requiring observations", () => {
    expect(isSeedIndexable(validSeed, [...sources], currentVersion)).toBe(true);
  });

  it.each([
    ["missing screenshot", { imageUrl: undefined }],
    ["missing acquisition and cost", { acquisition: undefined, cost: undefined }],
    ["editor noindex", { indexing: "noindex" }],
    ["empty indexing reason", { indexingReason: "" }],
    ["stale seed", { gameVersion: "2026-07-26" }],
  ] as const)("rejects %s", (_label, change) => {
    expect(
      isSeedIndexable({ ...validSeed, ...change }, [...sources], currentVersion),
    ).toBe(false);
  });

  it("rejects fewer than three unique sourced facts", () => {
    expect(
      isSeedIndexable(
        { ...validSeed, facts: validSeed.facts.slice(0, 2) },
        [...sources],
        currentVersion,
      ),
    ).toBe(false);
  });

  it("rejects duplicate fact keys", () => {
    expect(
      isSeedIndexable(
        {
          ...validSeed,
          facts: [validSeed.facts[0], validSeed.facts[0], validSeed.facts[2]],
        },
        [...sources],
        currentVersion,
      ),
    ).toBe(false);
  });

  it("rejects a broken fact source", () => {
    expect(
      isSeedIndexable(
        {
          ...validSeed,
          facts: [
            ...validSeed.facts.slice(0, 2),
            { ...validSeed.facts[2], sourceIds: ["missing-source"] },
          ],
        },
        [...sources],
        currentVersion,
      ),
    ).toBe(false);
  });

  it("rejects a stale source", () => {
    expect(
      isSeedIndexable(
        validSeed,
        sources.map((source) =>
          source.id === "source-fact-3"
            ? { ...source, gameVersion: "2026-07-26" }
            : source,
        ),
        currentVersion,
      ),
    ).toBe(false);
  });

  it("rejects an unverified current version", () => {
    expect(isSeedIndexable(validSeed, [...sources], "unverified")).toBe(false);
  });

  it("marks mismatched or unverified versions as needing recheck", () => {
    expect(getEffectiveStatus("verified", currentVersion, currentVersion)).toBe(
      "verified",
    );
    expect(getEffectiveStatus("observed", "2026-07-26", currentVersion)).toBe(
      "needs_recheck",
    );
    expect(getEffectiveStatus("verified", "unverified", "unverified")).toBe(
      "needs_recheck",
    );
  });
});
