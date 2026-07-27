import { describe, expect, it } from "vitest";

import { getSubmissionConfig } from "./page";

describe("submit-data page configuration", () => {
  it("enables the local file inbox only outside production", () => {
    expect(
      getSubmissionConfig({
        cwd: "C:\\workspace",
        environment: {
          MODERATION_INBOX_DRIVER: "file",
          SUBMISSION_RETENTION_DAYS: "30",
        },
        nodeEnv: "development",
      }),
    ).toMatchObject({ enabled: true, retentionDays: "30" });

    expect(
      getSubmissionConfig({
        cwd: "C:\\workspace",
        environment: {
          MODERATION_INBOX_DRIVER: "file",
          SUBMISSION_RETENTION_DAYS: "30",
        },
        nodeEnv: "production",
      }),
    ).toMatchObject({ enabled: false });
  });
});
