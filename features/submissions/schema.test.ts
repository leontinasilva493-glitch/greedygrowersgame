import { describe, expect, it } from "vitest";

import { submissionSchema } from "./schema";

const valid = {
  submissionType: "observation",
  seedId: "seed-a",
  treeInstanceId: "tree-local-1",
  serverSessionId: "session-local-1",
  observationProtocol: "precommitted_window",
  treeAgeAtStartSeconds: 0,
  treeAgeAtEndSeconds: 30,
  plannedStopSeconds: 30,
  event: "censored",
  censorReason: "planned_stop",
  exposureSeconds: 30,
  observedAt: "2026-07-26T12:00:00.000Z",
  gameVersion: "unverified",
  evidenceUrl: "https://example.org/evidence/video",
  evidenceConsent: true,
  notes: "Recorded from planting.",
  website: "",
};

describe("submissionSchema", () => {
  it("accepts a protocol-complete pending observation", () => {
    expect(submissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects non-HTTPS evidence and honeypot content", () => {
    expect(submissionSchema.safeParse({ ...valid, evidenceUrl: "http://example.org" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
  });

  it("rejects contradictory age and censor fields", () => {
    expect(submissionSchema.safeParse({ ...valid, treeAgeAtEndSeconds: 29 }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...valid, event: "lightning", censorReason: "planned_stop" }).success).toBe(false);
  });

  it("does not accept contributor identity fields", () => {
    expect(submissionSchema.safeParse({ ...valid, email: "player@example.org" }).success).toBe(false);
  });
});
