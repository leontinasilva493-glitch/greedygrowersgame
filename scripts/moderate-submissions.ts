import {
  createLocalInboxConfig,
  purgeExpiredLocalSubmissions,
  readLocalSubmission,
  reviewLocalSubmission,
} from "../features/submissions/local-inbox";

async function main() {
  const [command, receipt, decision, reviewer, ...reasonParts] = process.argv.slice(2);
  const config = createLocalInboxConfig({
    cwd: process.cwd(),
    driver: "file",
    nodeEnv: "development",
    retentionDays: process.env.SUBMISSION_RETENTION_DAYS,
  });
  if (!config) {
    throw new Error("Set SUBMISSION_RETENTION_DAYS to a positive integer first.");
  }

  if (command === "show" && receipt) {
    console.log(JSON.stringify(await readLocalSubmission(config, receipt), null, 2));
    return;
  }
  if (
    command === "review" &&
    receipt &&
    (decision === "approved" || decision === "rejected") &&
    reviewer &&
    reasonParts.length > 0
  ) {
    const reviewed = await reviewLocalSubmission(config, {
      receipt,
      decision,
      reviewer,
      reason: reasonParts.join(" "),
      reviewedAt: new Date().toISOString(),
    });
    console.log(JSON.stringify(reviewed, null, 2));
    return;
  }
  if (command === "purge") {
    const result = await purgeExpiredLocalSubmissions(config);
    console.log(`Purged ${result.deletedReceipts.length} expired local submissions.`);
    return;
  }

  throw new Error(
    "Usage: show <receipt> | review <receipt> <approved|rejected> <reviewer> <reason> | purge",
  );
}

void main();
