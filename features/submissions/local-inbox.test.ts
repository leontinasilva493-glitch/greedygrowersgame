import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { SubmissionPayload } from "./schema";
import {
  createLocalInboxConfig,
  purgeExpiredLocalSubmissions,
  readLocalSubmission,
  reviewLocalSubmission,
  writeLocalSubmission,
} from "./local-inbox";

const temporaryDirectories: string[] = [];
const payload: SubmissionPayload = {
  submissionType: "observation",
  treeInstanceId: "tree-1",
  serverSessionId: "session-1",
  observationProtocol: "precommitted_window",
  treeAgeAtStartSeconds: 0,
  treeAgeAtEndSeconds: 30,
  plannedStopSeconds: 30,
  event: "censored",
  censorReason: "planned_stop",
  exposureSeconds: 30,
  observedAt: "2026-07-27T00:00:00.000Z",
  gameVersion: "unverified",
  evidenceUrl: "https://evidence.example/REC-01.mp4",
  evidenceConsent: true,
  website: "",
};

async function workspace() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "greedy-inbox-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("local moderation inbox", () => {
  it("is available only outside production with a positive retention period", async () => {
    const cwd = await workspace();

    expect(
      createLocalInboxConfig({
        cwd,
        driver: "file",
        nodeEnv: "development",
        retentionDays: "30",
      }),
    ).toMatchObject({ retentionDays: 30 });
    expect(
      createLocalInboxConfig({
        cwd,
        driver: "file",
        nodeEnv: "production",
        retentionDays: "30",
      }),
    ).toBeNull();
  });

  it("writes a receipt-first pending record and never touches public data", async () => {
    const cwd = await workspace();
    const config = createLocalInboxConfig({
      cwd,
      driver: "file",
      nodeEnv: "development",
      retentionDays: "30",
    });
    expect(config).not.toBeNull();

    await writeLocalSubmission(config!, {
      receipt: "11111111-1111-4111-8111-111111111111",
      retentionDays: 30,
      submittedAt: "2026-07-27T00:00:00.000Z",
      payload,
    });

    const stored = await readLocalSubmission(
      config!,
      "11111111-1111-4111-8111-111111111111",
    );
    expect(stored).toMatchObject({
      status: "pending_review",
      receipt: "11111111-1111-4111-8111-111111111111",
    });
    await expect(readFile(path.join(cwd, "data", "observations.json"))).rejects.toThrow();
  });

  it("records a manual decision without publishing the payload", async () => {
    const cwd = await workspace();
    const config = createLocalInboxConfig({
      cwd,
      driver: "file",
      nodeEnv: "development",
      retentionDays: "30",
    })!;
    const receipt = "22222222-2222-4222-8222-222222222222";
    await writeLocalSubmission(config, {
      receipt,
      retentionDays: 30,
      submittedAt: "2026-07-27T00:00:00.000Z",
      payload,
    });

    const reviewed = await reviewLocalSubmission(config, {
      receipt,
      decision: "rejected",
      reviewer: "local-reviewer",
      reason: "Evidence HUD is unreadable.",
      reviewedAt: "2026-07-28T00:00:00.000Z",
    });

    expect(reviewed).toMatchObject({
      status: "rejected",
      review: { reviewer: "local-reviewer" },
    });
  });

  it("purges every expired raw inbox record, including approved submissions", async () => {
    const cwd = await workspace();
    const config = createLocalInboxConfig({
      cwd,
      driver: "file",
      nodeEnv: "development",
      retentionDays: "1",
    })!;
    for (const receipt of [
      "33333333-3333-4333-8333-333333333333",
      "44444444-4444-4444-8444-444444444444",
    ]) {
      await writeLocalSubmission(config, {
        receipt,
        retentionDays: 1,
        submittedAt: "2026-07-20T00:00:00.000Z",
        payload,
      });
    }
    await reviewLocalSubmission(config, {
      receipt: "44444444-4444-4444-8444-444444444444",
      decision: "approved",
      reviewer: "local-reviewer",
      reason: "Evidence accepted for manual promotion.",
      reviewedAt: "2026-07-20T01:00:00.000Z",
    });

    const result = await purgeExpiredLocalSubmissions(
      config,
      new Date("2026-07-27T00:00:00.000Z"),
    );

    expect(result.deletedReceipts).toEqual([
      "33333333-3333-4333-8333-333333333333",
      "44444444-4444-4444-8444-444444444444",
    ]);
    await expect(
      readLocalSubmission(config, "44444444-4444-4444-8444-444444444444"),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
