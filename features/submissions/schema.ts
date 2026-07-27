import { z } from "zod";

const safeNumber = z.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER);
const httpsUrl = z.url().refine((value) => new URL(value).protocol === "https:", {
  message: "Evidence URL must use HTTPS.",
});

export const submissionSchema = z
  .object({
    submissionType: z.enum(["observation", "growth_measurement"]),
    seedId: z.string().trim().min(1).optional(),
    treeInstanceId: z.string().trim().min(1).max(120),
    serverSessionId: z.string().trim().min(1).max(120),
    observationProtocol: z.enum(["precommitted_window", "opportunistic"]),
    treeAgeAtStartSeconds: safeNumber,
    treeAgeAtEndSeconds: safeNumber,
    plannedStopSeconds: safeNumber.optional(),
    event: z.enum(["lightning", "censored"]),
    censorReason: z
      .enum(["planned_stop", "session_ended", "lost_to_followup", "harvested"])
      .optional(),
    eventTimePrecision: z.enum(["exact_second", "estimated_second", "unknown"]).optional(),
    currentValue: safeNumber.optional(),
    endValue: safeNumber.optional(),
    currency: z.string().trim().min(1).max(40).optional(),
    exposureSeconds: safeNumber.positive(),
    observedAt: z.iso.datetime({ offset: true }),
    gameVersion: z.string().trim().min(1),
    evidenceUrl: httpsUrl,
    evidenceConsent: z.literal(true),
    notes: z.string().max(1000).optional(),
    website: z.literal(""),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.treeAgeAtEndSeconds - value.treeAgeAtStartSeconds !==
      value.exposureSeconds
    ) {
      context.addIssue({
        code: "custom",
        path: ["exposureSeconds"],
        message: "Exposure must equal the recorded age interval.",
      });
    }
    if (Date.parse(value.observedAt) > Date.now()) {
      context.addIssue({ code: "custom", path: ["observedAt"], message: "Observation cannot be in the future." });
    }
    if (value.event === "lightning" && value.censorReason) {
      context.addIssue({ code: "custom", path: ["censorReason"], message: "Lightning events cannot have a censor reason." });
    }
    if (value.event === "censored" && !value.censorReason) {
      context.addIssue({ code: "custom", path: ["censorReason"], message: "Censored observations require a reason." });
    }
    if (
      value.censorReason === "planned_stop" &&
      value.plannedStopSeconds !== value.exposureSeconds
    ) {
      context.addIssue({ code: "custom", path: ["plannedStopSeconds"], message: "A planned stop must match exposure." });
    }
    if (
      (value.currentValue !== undefined || value.endValue !== undefined) &&
      !value.currency
    ) {
      context.addIssue({ code: "custom", path: ["currency"], message: "Currency/unit is required with values." });
    }
  });

export type SubmissionPayload = z.infer<typeof submissionSchema>;
