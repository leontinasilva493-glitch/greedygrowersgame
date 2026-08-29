import { z } from "zod";

export const REQUIRED_PHASE_ZERO_RECORDINGS = [
  "REC-01",
  "REC-02",
  "REC-03",
  "REC-04",
  "REC-05",
] as const;

export const ALL_RECORDING_IDS = [
  ...REQUIRED_PHASE_ZERO_RECORDINGS,
  "REC-06",
  "REC-07",
  "REC-08",
  "REC-09",
  "REC-10",
] as const;

const versionBasisSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("unverified"),
    label: z.literal("unverified"),
    sourceIds: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("official"),
    label: z.string().trim().min(1),
    sourceIds: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    kind: z.literal("observational_cohort"),
    label: z.string().regex(/^cohort-\d{4}-\d{2}-\d{2}$/),
    sourceIds: z.array(z.string().trim().min(1)).min(1),
  }),
]);

const recordingSchema = z
  .object({
    id: z.enum(ALL_RECORDING_IDS),
    status: z.enum(["missing", "received", "approved", "rejected"]),
    fileOrUrl: z.string().url().optional(),
    capturedAt: z.string().datetime().optional(),
    deviceAndPlatform: z.string().trim().min(1).optional(),
    durationSeconds: z.number().positive().optional(),
    anonymousServerSessionId: z.string().trim().min(1).optional(),
    privacyReviewed: z.boolean().optional(),
    notes: z.string().trim().optional(),
  })
  .superRefine((recording, context) => {
    if (recording.status !== "approved") return;

    for (const field of [
      "fileOrUrl",
      "capturedAt",
      "deviceAndPlatform",
      "durationSeconds",
      "anonymousServerSessionId",
    ] as const) {
      if (recording[field] === undefined) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `${field} is required for approved evidence.`,
        });
      }
    }
    if (recording.privacyReviewed !== true) {
      context.addIssue({
        code: "custom",
        path: ["privacyReviewed"],
        message: "Approved evidence must pass privacy review.",
      });
    }
  });

export const evidenceManifestSchema = z
  .object({
    auditDate: z.string().date(),
    versionBasis: versionBasisSchema,
    publicationApprovals: z
      .object({
        beginnerGuideReviewed: z.boolean(),
        lightningGuideReviewed: z.boolean().default(false),
        lightningGuideSourceIds: z
          .array(z.string().trim().min(1))
          .default([]),
        mutationsGuideReviewed: z.boolean().default(false),
        mutationsGuideSourceIds: z
          .array(z.string().trim().min(1))
          .default([]),
        predictionPotionGuideReviewed: z.boolean().default(false),
        predictionPotionGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        petsGuideReviewed: z.boolean().default(false),
        petsGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        ticketsGuideReviewed: z.boolean().default(false),
        ticketsGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        rebirthGuideReviewed: z.boolean().default(false),
        rebirthGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        bigTreeGuideReviewed: z.boolean().default(false),
        bigTreeGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        fertilizerGuideReviewed: z.boolean().default(false),
        fertilizerGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        wormsGuideReviewed: z.boolean().default(false),
        wormsGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        farmersMarketGuideReviewed: z.boolean().default(false),
        farmersMarketGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
        seedChairGuideReviewed: z.boolean().default(false),
        seedChairGuideSourceIds: z.array(z.string().trim().min(1)).default([]),
      })
      .superRefine((approval, context) => {
        if (
          approval.lightningGuideReviewed &&
          approval.lightningGuideSourceIds.length === 0
        ) {
          context.addIssue({
            code: "custom",
            path: ["lightningGuideSourceIds"],
            message: "A reviewed lightning guide must bind explicit evidence sources.",
          });
        }
        if (
          approval.mutationsGuideReviewed &&
          new Set(approval.mutationsGuideSourceIds).size < 2
        ) {
          context.addIssue({
            code: "custom",
            path: ["mutationsGuideSourceIds"],
            message: "A reviewed mutations guide must bind independent video and editorial sources.",
          });
        }
        for (const [reviewed, sourceIds, path, label] of [
          [approval.predictionPotionGuideReviewed, approval.predictionPotionGuideSourceIds, "predictionPotionGuideSourceIds", "Prediction Potion"],
          [approval.petsGuideReviewed, approval.petsGuideSourceIds, "petsGuideSourceIds", "pets"],
          [approval.ticketsGuideReviewed, approval.ticketsGuideSourceIds, "ticketsGuideSourceIds", "Tickets"],
          [approval.rebirthGuideReviewed, approval.rebirthGuideSourceIds, "rebirthGuideSourceIds", "Rebirth"],
          [approval.bigTreeGuideReviewed, approval.bigTreeGuideSourceIds, "bigTreeGuideSourceIds", "big-tree"],
          [approval.fertilizerGuideReviewed, approval.fertilizerGuideSourceIds, "fertilizerGuideSourceIds", "fertilizer"],
          [approval.wormsGuideReviewed, approval.wormsGuideSourceIds, "wormsGuideSourceIds", "worms"],
          [approval.farmersMarketGuideReviewed, approval.farmersMarketGuideSourceIds, "farmersMarketGuideSourceIds", "Farmer's Market"],
          [approval.seedChairGuideReviewed, approval.seedChairGuideSourceIds, "seedChairGuideSourceIds", "seed-feeding chair"],
        ] as const) {
          if (reviewed && new Set(sourceIds).size < 2) {
            context.addIssue({
              code: "custom",
              path: [path],
              message: `A reviewed ${label} guide must bind gameplay evidence and independent support.`,
            });
          }
        }
      })
      .default({
        beginnerGuideReviewed: false,
        lightningGuideReviewed: false,
        lightningGuideSourceIds: [],
        mutationsGuideReviewed: false,
        mutationsGuideSourceIds: [],
        predictionPotionGuideReviewed: false,
        predictionPotionGuideSourceIds: [],
        petsGuideReviewed: false,
        petsGuideSourceIds: [],
        ticketsGuideReviewed: false,
        ticketsGuideSourceIds: [],
        rebirthGuideReviewed: false,
        rebirthGuideSourceIds: [],
        bigTreeGuideReviewed: false,
        bigTreeGuideSourceIds: [],
        fertilizerGuideReviewed: false,
        fertilizerGuideSourceIds: [],
        wormsGuideReviewed: false,
        wormsGuideSourceIds: [],
        farmersMarketGuideReviewed: false,
        farmersMarketGuideSourceIds: [],
        seedChairGuideReviewed: false,
        seedChairGuideSourceIds: [],
      }),
    recordings: z.array(recordingSchema),
  })
  .superRefine((manifest, context) => {
    const ids = manifest.recordings.map((recording) => recording.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["recordings"],
        message: "Recording IDs must be unique.",
      });
    }
  });

export type EvidenceManifest = z.infer<typeof evidenceManifestSchema>;

export function evaluatePhaseZeroEvidence(
  manifest: EvidenceManifest,
  { officialSourceIds = [] }: { officialSourceIds?: string[] } = {},
) {
  const approvedRequired = manifest.recordings.filter(
    (recording) =>
      REQUIRED_PHASE_ZERO_RECORDINGS.includes(
        recording.id as (typeof REQUIRED_PHASE_ZERO_RECORDINGS)[number],
      ) && recording.status === "approved",
  );
  const approvedIds = new Set(approvedRequired.map((recording) => recording.id));
  const missingRecordingIds = REQUIRED_PHASE_ZERO_RECORDINGS.filter(
    (id) => !approvedIds.has(id),
  );
  const independentSessionCount = new Set(
    approvedRequired.map((recording) => recording.anonymousServerSessionId),
  ).size;
  const reasons: string[] = [];

  if (missingRecordingIds.length > 0) {
    reasons.push(`Missing approved recordings: ${missingRecordingIds.join(", ")}.`);
  }
  if (
    approvedRequired.length === REQUIRED_PHASE_ZERO_RECORDINGS.length &&
    independentSessionCount < REQUIRED_PHASE_ZERO_RECORDINGS.length
  ) {
    reasons.push("REC-01 through REC-05 must come from independent server sessions.");
  }
  if (manifest.versionBasis.kind === "unverified") {
    reasons.push("The game version basis is still unverified.");
  }
  if (manifest.versionBasis.kind === "official") {
    const knownOfficialIds = new Set(officialSourceIds);
    const invalidIds = manifest.versionBasis.sourceIds.filter(
      (sourceId) => !knownOfficialIds.has(sourceId),
    );
    if (invalidIds.length > 0) {
      reasons.push(
        `Official version basis references unknown official sources: ${invalidIds.join(", ")}.`,
      );
    }
  }
  if (manifest.versionBasis.kind === "observational_cohort") {
    const approvedRecordingIds = new Set(
      manifest.recordings
        .filter((recording) => recording.status === "approved")
        .map((recording) => recording.id),
    );
    const invalidIds = manifest.versionBasis.sourceIds.filter(
      (sourceId) => !approvedRecordingIds.has(sourceId as (typeof ALL_RECORDING_IDS)[number]),
    );
    if (invalidIds.length > 0) {
      reasons.push(
        `Observational version basis references unapproved recordings: ${invalidIds.join(", ")}.`,
      );
    }
  }

  return {
    ready: reasons.length === 0,
    approvedRequiredCount: approvedRequired.length,
    independentSessionCount,
    missingRecordingIds,
    reasons,
    cohortLabel: manifest.versionBasis.label,
  };
}
