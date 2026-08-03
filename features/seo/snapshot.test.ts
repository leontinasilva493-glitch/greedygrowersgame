import { describe, expect, it } from "vitest";

import { evidenceManifestSchema } from "@/features/evidence/manifest";

import { isLightningGuideVerified, isMutationsGuideVerified } from "./snapshot";

describe("indexability snapshot evidence bindings", () => {
  it("does not treat an unrelated official source as lightning guide evidence", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-07-27",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      publicationApprovals: {
        beginnerGuideReviewed: false,
        lightningGuideReviewed: false,
        lightningGuideSourceIds: [],
      },
      recordings: [],
    });
    const sources = [
      {
        id: "official-game-page",
        type: "official" as const,
        title: "Official game page",
        url: "https://www.roblox.com/games/example",
        capturedAt: "2026-07-27T00:00:00.000Z",
      },
    ];

    expect(isLightningGuideVerified(manifest, sources)).toBe(false);
  });

  it("accepts only an explicitly reviewed lightning source binding", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-07-27",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      publicationApprovals: {
        beginnerGuideReviewed: false,
        lightningGuideReviewed: true,
        lightningGuideSourceIds: ["lightning-recording"],
      },
      recordings: [],
    });
    const sources = [
      {
        id: "lightning-recording",
        type: "gameplay" as const,
        title: "Lightning guide recording",
        url: "https://evidence.example/lightning.mp4",
        capturedAt: "2026-07-27T00:00:00.000Z",
      },
    ];

    expect(isLightningGuideVerified(manifest, sources)).toBe(true);
  });
});

describe("mutations guide evidence bindings", () => {
  it("requires a current version plus reviewed gameplay and editorial sources", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-08-04",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      publicationApprovals: {
        beginnerGuideReviewed: false,
        lightningGuideReviewed: false,
        lightningGuideSourceIds: [],
        mutationsGuideReviewed: true,
        mutationsGuideSourceIds: ["mutations-video", "mutations-report"],
      },
      recordings: [],
    });
    const sources = [
      {
        id: "mutations-video",
        type: "gameplay" as const,
        title: "Mutation walkthrough",
        url: "https://www.youtube.com/watch?v=video",
        capturedAt: "2026-08-04T00:00:00.000Z",
      },
      {
        id: "mutations-report",
        type: "editorial" as const,
        title: "Mutation report",
        url: "https://example.com/mutations",
        capturedAt: "2026-08-04T00:00:00.000Z",
      },
    ];

    expect(isMutationsGuideVerified(manifest, sources, "unverified")).toBe(false);
    expect(isMutationsGuideVerified(manifest, sources, "2026.08.03")).toBe(true);
  });
});
