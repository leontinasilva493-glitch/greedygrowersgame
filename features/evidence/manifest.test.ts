import { describe, expect, it } from "vitest";

import {
  REQUIRED_PHASE_ZERO_RECORDINGS,
  evaluatePhaseZeroEvidence,
  evidenceManifestSchema,
} from "./manifest";

function approvedRecording(id: (typeof REQUIRED_PHASE_ZERO_RECORDINGS)[number], session: string) {
  return {
    id,
    status: "approved" as const,
    fileOrUrl: `https://evidence.example/${id}.mp4`,
    capturedAt: "2026-07-27T01:00:00.000Z",
    deviceAndPlatform: "PC / Windows",
    durationSeconds: 120,
    anonymousServerSessionId: session,
    privacyReviewed: true,
  };
}

describe("phase zero evidence manifest", () => {
  it("keeps an empty manifest closed and reports every required recording", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-07-27",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      recordings: [],
    });

    const gate = evaluatePhaseZeroEvidence(manifest);

    expect(gate.ready).toBe(false);
    expect(gate.approvedRequiredCount).toBe(0);
    expect(gate.missingRecordingIds).toEqual(REQUIRED_PHASE_ZERO_RECORDINGS);
  });

  it("opens only when REC-01 through REC-05 are approved in independent sessions", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-07-27",
      versionBasis: {
        kind: "observational_cohort",
        label: "cohort-2026-07-27",
        sourceIds: ["REC-01", "REC-02", "REC-03", "REC-04", "REC-05"],
      },
      recordings: REQUIRED_PHASE_ZERO_RECORDINGS.map((id, index) =>
        approvedRecording(id, `session-${index + 1}`),
      ),
    });

    expect(evaluatePhaseZeroEvidence(manifest)).toMatchObject({
      ready: true,
      approvedRequiredCount: 5,
      missingRecordingIds: [],
    });
  });

  it("rejects an official version basis unless every source is a known official source", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-07-27",
      versionBasis: {
        kind: "official",
        label: "2026.07.27",
        sourceIds: ["made-up-official-source"],
      },
      recordings: REQUIRED_PHASE_ZERO_RECORDINGS.map((id, index) =>
        approvedRecording(id, `session-${index + 1}`),
      ),
    });

    expect(evaluatePhaseZeroEvidence(manifest)).toMatchObject({ ready: false });
    expect(
      evaluatePhaseZeroEvidence(manifest, {
        officialSourceIds: ["made-up-official-source"],
      }),
    ).toMatchObject({ ready: true });
  });

  it("rejects an observational version basis that cites missing recordings", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-07-27",
      versionBasis: {
        kind: "observational_cohort",
        label: "cohort-2026-07-27",
        sourceIds: ["REC-01", "REC-02", "REC-03", "REC-04", "REC-10"],
      },
      recordings: REQUIRED_PHASE_ZERO_RECORDINGS.map((id, index) =>
        approvedRecording(id, `session-${index + 1}`),
      ),
    });

    expect(evaluatePhaseZeroEvidence(manifest)).toMatchObject({ ready: false });
  });

  it("requires a lightning-specific source binding before a guide can be reviewed", () => {
    const result = evidenceManifestSchema.safeParse({
      auditDate: "2026-07-27",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      publicationApprovals: {
        beginnerGuideReviewed: false,
        lightningGuideReviewed: true,
        lightningGuideSourceIds: [],
      },
      recordings: [],
    });

    expect(result.success).toBe(false);
  });

  it("requires both a reviewed video and editorial source before a mutations guide can be reviewed", () => {
    const result = evidenceManifestSchema.safeParse({
      auditDate: "2026-08-04",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      publicationApprovals: {
        beginnerGuideReviewed: false,
        lightningGuideReviewed: false,
        lightningGuideSourceIds: [],
        mutationsGuideReviewed: true,
        mutationsGuideSourceIds: ["mutations-video"],
      },
      recordings: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects approved evidence without review metadata", () => {
    const result = evidenceManifestSchema.safeParse({
      auditDate: "2026-07-27",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      recordings: [{ id: "REC-01", status: "approved" }],
    });

    expect(result.success).toBe(false);
  });

  it("does not accept five required recordings from one reused server session", () => {
    const manifest = evidenceManifestSchema.parse({
      auditDate: "2026-07-27",
      versionBasis: { kind: "unverified", label: "unverified", sourceIds: [] },
      recordings: REQUIRED_PHASE_ZERO_RECORDINGS.map((id) =>
        approvedRecording(id, "same-session"),
      ),
    });

    expect(evaluatePhaseZeroEvidence(manifest)).toMatchObject({
      ready: false,
      approvedRequiredCount: 5,
    });
  });
});
