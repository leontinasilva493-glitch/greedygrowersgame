import { z } from "zod";

const idSchema = z.string().trim().min(1);
const isoDateTimeSchema = z.iso.datetime({ offset: true });
const httpsUrlSchema = z.url().refine((value) => new URL(value).protocol === "https:", {
  message: "URL must use HTTPS.",
});
const safeNonNegativeNumberSchema = z
  .number()
  .finite()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
const nonEmptyIdsSchema = z.array(idSchema).min(1);

export const dataStatusSchema = z.enum([
  "verified",
  "observed",
  "estimated",
  "conflicting",
  "unknown",
  "needs_recheck",
]);
export const reviewStateSchema = z.enum(["pending", "approved", "rejected"]);

export const sourceSchema = z.object({
  id: idSchema,
  type: z.enum(["official", "gameplay", "community", "editorial"]),
  title: idSchema,
  url: httpsUrlSchema,
  capturedAt: isoDateTimeSchema,
  gameVersion: idSchema.optional(),
  notes: z.string().optional(),
});

export const seedSchema = z
  .object({
    id: idSchema,
    slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: idSchema,
    imageUrl: httpsUrlSchema.optional(),
    imageSourceId: idSchema.optional(),
    rarity: idSchema.optional(),
    acquisition: idSchema.optional(),
    cost: safeNonNegativeNumberSchema.optional(),
    currency: idSchema.optional(),
    facts: z.array(
      z.object({
        key: idSchema,
        value: idSchema,
        sourceIds: nonEmptyIdsSchema,
      }),
    ),
    status: dataStatusSchema,
    gameVersion: idSchema,
    lastVerified: isoDateTimeSchema,
    sourceIds: z.array(idSchema),
    indexing: z.enum(["index", "noindex"]),
    indexingReason: z.string(),
  })
  .superRefine((seed, context) => {
    if (seed.cost !== undefined && !seed.currency) {
      context.addIssue({
        code: "custom",
        path: ["currency"],
        message: "Currency is required when cost is present.",
      });
    }
    if (seed.imageUrl && !seed.imageSourceId) {
      context.addIssue({
        code: "custom",
        path: ["imageSourceId"],
        message: "Image source is required when an image is present.",
      });
    }
  });

export const observationSchema = z
  .object({
    id: idSchema,
    seedId: idSchema.optional(),
    treeInstanceId: idSchema,
    serverSessionId: idSchema,
    gameVersion: idSchema,
    startedAt: isoDateTimeSchema,
    endedAt: isoDateTimeSchema,
    treeAgeAtStartSeconds: safeNonNegativeNumberSchema,
    treeAgeAtEndSeconds: safeNonNegativeNumberSchema,
    exposureSeconds: safeNonNegativeNumberSchema.positive(),
    plannedStopSeconds: safeNonNegativeNumberSchema.positive().optional(),
    observationProtocol: z.enum(["precommitted_window", "opportunistic"]),
    event: z.enum(["lightning", "censored"]),
    censorReason: z
      .enum(["planned_stop", "session_ended", "lost_to_followup", "harvested"])
      .optional(),
    residualValue: safeNonNegativeNumberSchema.optional(),
    sourceId: idSchema,
    evidenceUrl: httpsUrlSchema,
    status: dataStatusSchema,
    reviewState: reviewStateSchema,
    reviewedAt: isoDateTimeSchema.optional(),
    lastVerified: isoDateTimeSchema,
    notes: z.string().optional(),
  })
  .superRefine((observation, context) => {
    const elapsed =
      (Date.parse(observation.endedAt) - Date.parse(observation.startedAt)) / 1000;
    const ageElapsed =
      observation.treeAgeAtEndSeconds - observation.treeAgeAtStartSeconds;
    const add = (path: string, message: string) =>
      context.addIssue({ code: "custom", path: [path], message });

    if (elapsed <= 0) add("endedAt", "End must be after start.");
    if (Math.abs(elapsed - observation.exposureSeconds) > 1e-6) {
      add("exposureSeconds", "Exposure must match timestamp duration.");
    }
    if (Math.abs(ageElapsed - observation.exposureSeconds) > 1e-6) {
      add("treeAgeAtEndSeconds", "Tree age duration must match exposure.");
    }
    if (observation.event === "lightning" && observation.censorReason) {
      add("censorReason", "Lightning events cannot have a censor reason.");
    }
    if (observation.event === "censored" && !observation.censorReason) {
      add("censorReason", "Censored observations require a censor reason.");
    }
    if (
      observation.observationProtocol === "precommitted_window" &&
      observation.plannedStopSeconds === undefined
    ) {
      add("plannedStopSeconds", "Precommitted observations require a planned stop.");
    }
    if (
      observation.observationProtocol === "opportunistic" &&
      observation.plannedStopSeconds !== undefined
    ) {
      add("plannedStopSeconds", "Opportunistic observations cannot claim a planned stop.");
    }
    if (
      observation.event === "lightning" &&
      observation.plannedStopSeconds !== undefined &&
      observation.exposureSeconds > observation.plannedStopSeconds
    ) {
      add("exposureSeconds", "Lightning cannot occur after the planned stop.");
    }
    if (
      observation.censorReason === "planned_stop" &&
      observation.plannedStopSeconds !== observation.exposureSeconds
    ) {
      add("exposureSeconds", "Planned-stop censoring must end at the planned stop.");
    }
  });

export const growthMeasurementSchema = z.object({
  id: idSchema,
  seedId: idSchema,
  treeInstanceId: idSchema,
  serverSessionId: idSchema,
  gameVersion: idSchema,
  treeAgeSeconds: safeNonNegativeNumberSchema,
  value: safeNonNegativeNumberSchema,
  currency: idSchema,
  observedAt: isoDateTimeSchema,
  sourceId: idSchema,
  evidenceUrl: httpsUrlSchema,
  status: dataStatusSchema,
  reviewState: reviewStateSchema,
  reviewedAt: isoDateTimeSchema.optional(),
  lastVerified: isoDateTimeSchema,
});

const codeEntrySchema = z.object({
  code: idSchema,
  reward: idSchema.optional(),
  sourceIds: nonEmptyIdsSchema,
  checkedAt: isoDateTimeSchema,
});

export const codesDatasetSchema = z.object({
  redeemUiVerified: z.boolean(),
  lastChecked: isoDateTimeSchema,
  active: z.array(codeEntrySchema),
  expired: z.array(codeEntrySchema),
  sourceIds: z.array(idSchema),
});

export const gameVersionSchema = z.object({
  version: idSchema,
  checkedAt: isoDateTimeSchema,
  sourceIds: z.array(idSchema),
});

export const updateSchema = z.object({
  id: idSchema,
  type: z.enum(["game", "data"]),
  publishedAt: isoDateTimeSchema,
  gameVersion: idSchema,
  summary: idSchema,
  sourceIds: nonEmptyIdsSchema,
  invalidatesPriorData: z.boolean(),
  status: dataStatusSchema,
  reviewState: reviewStateSchema,
});

export const dataChangeSchema = z.object({
  id: idSchema,
  changedAt: isoDateTimeSchema,
  recordIds: nonEmptyIdsSchema,
  sourceIds: nonEmptyIdsSchema,
  reviewer: idSchema,
  summary: idSchema,
  methodVersion: idSchema,
});

export const seedsSchema = z.array(seedSchema);
export const observationsSchema = z.array(observationSchema);
export const growthMeasurementsSchema = z.array(growthMeasurementSchema);
export const sourcesSchema = z.array(sourceSchema);
export const updatesSchema = z.array(updateSchema);
export const dataChangelogSchema = z.array(dataChangeSchema);
