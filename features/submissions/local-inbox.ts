import {
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type { SubmissionPayload } from "./schema";

const RECEIPT_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface LocalInboxConfig {
  directory: string;
  retentionDays: number;
}

export interface SubmissionEnvelope {
  receipt: string;
  retentionDays: number;
  submittedAt: string;
  payload: SubmissionPayload;
}

export interface LocalSubmissionRecord extends SubmissionEnvelope {
  status: "pending_review" | "approved" | "rejected";
  expiresAt: string;
  review?: {
    reviewer: string;
    reason: string;
    reviewedAt: string;
  };
}

export function createLocalInboxConfig({
  cwd,
  driver,
  nodeEnv,
  retentionDays,
}: {
  cwd: string;
  driver?: string;
  nodeEnv?: string;
  retentionDays?: string;
}): LocalInboxConfig | null {
  const parsedRetention = Number(retentionDays);
  if (
    driver !== "file" ||
    nodeEnv === "production" ||
    !Number.isInteger(parsedRetention) ||
    parsedRetention <= 0
  ) {
    return null;
  }

  return {
    directory: path.join(cwd, ".local-data", "moderation"),
    retentionDays: parsedRetention,
  };
}

function recordPath(config: LocalInboxConfig, receipt: string) {
  if (!RECEIPT_PATTERN.test(receipt)) {
    throw new Error("Invalid moderation receipt.");
  }
  return path.join(config.directory, "records", `${receipt}.json`);
}

function expiryDate(submittedAt: string, retentionDays: number) {
  return new Date(
    Date.parse(submittedAt) + retentionDays * 24 * 60 * 60 * 1000,
  ).toISOString();
}

export async function writeLocalSubmission(
  config: LocalInboxConfig,
  envelope: SubmissionEnvelope,
) {
  const target = recordPath(config, envelope.receipt);
  await mkdir(path.dirname(target), { recursive: true });
  const record: LocalSubmissionRecord = {
    ...envelope,
    status: "pending_review",
    expiresAt: expiryDate(envelope.submittedAt, config.retentionDays),
  };
  await writeFile(target, `${JSON.stringify(record, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  return record;
}

export async function readLocalSubmission(
  config: LocalInboxConfig,
  receipt: string,
) {
  return JSON.parse(
    await readFile(recordPath(config, receipt), "utf8"),
  ) as LocalSubmissionRecord;
}

export async function reviewLocalSubmission(
  config: LocalInboxConfig,
  decision: {
    receipt: string;
    decision: "approved" | "rejected";
    reviewer: string;
    reason: string;
    reviewedAt: string;
  },
) {
  const current = await readLocalSubmission(config, decision.receipt);
  if (current.status !== "pending_review") {
    throw new Error("Only pending submissions can be reviewed.");
  }
  const reviewed: LocalSubmissionRecord = {
    ...current,
    status: decision.decision,
    review: {
      reviewer: decision.reviewer,
      reason: decision.reason,
      reviewedAt: decision.reviewedAt,
    },
  };
  await writeFile(
    recordPath(config, decision.receipt),
    `${JSON.stringify(reviewed, null, 2)}\n`,
    "utf8",
  );
  return reviewed;
}

export async function purgeExpiredLocalSubmissions(
  config: LocalInboxConfig,
  now = new Date(),
) {
  const directory = path.join(config.directory, "records");
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { deletedReceipts: [] as string[] };
    }
    throw error;
  }

  const deletedReceipts: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const receipt = entry.name.slice(0, -5);
    const record = await readLocalSubmission(config, receipt);
    if (Date.parse(record.expiresAt) <= now.getTime()) {
      await unlink(recordPath(config, receipt));
      deletedReceipts.push(receipt);
    }
  }

  return { deletedReceipts: deletedReceipts.sort() };
}
