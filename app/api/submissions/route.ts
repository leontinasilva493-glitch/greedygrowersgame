import { submissionSchema } from "../../../features/submissions/schema";
import {
  createLocalInboxConfig,
  writeLocalSubmission,
} from "../../../features/submissions/local-inbox";

const MAX_REQUEST_BYTES = 16 * 1024;
const WEBHOOK_TIMEOUT_MS = 8_000;

function json(status: number, body: unknown) {
  return Response.json(body, { status });
}

function retentionDays() {
  const value = Number(process.env.SUBMISSION_RETENTION_DAYS);
  return Number.isInteger(value) && value > 0 ? value : null;
}

async function readBodyWithLimit(request: Request) {
  if (!request.body) {
    return { ok: true as const, raw: "" };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const parts: string[] = [];
  let bytesRead = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      if (bytesRead > MAX_REQUEST_BYTES) {
        await reader.cancel("Request body is too large.");
        return { ok: false as const, status: 413, error: "Request body is too large." };
      }
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
    return { ok: true as const, raw: parts.join("") };
  } catch {
    return { ok: false as const, status: 400, error: "Unable to read request body." };
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    return json(413, { error: "Request body is too large." });
  }

  const retention = retentionDays();
  const localInbox = createLocalInboxConfig({
    cwd: process.cwd(),
    driver: process.env.MODERATION_INBOX_DRIVER,
    nodeEnv: process.env.NODE_ENV,
    retentionDays: process.env.SUBMISSION_RETENTION_DAYS,
  });
  if (
    !localInbox &&
    (!process.env.DATA_SUBMISSION_WEBHOOK_URL ||
      !process.env.DATA_SUBMISSION_WEBHOOK_TOKEN ||
      retention === null)
  ) {
    return json(503, { error: "Submission inbox is unavailable." });
  }

  const bodyResult = await readBodyWithLimit(request);
  if (!bodyResult.ok) {
    return json(bodyResult.status, { error: bodyResult.error });
  }
  const raw = bodyResult.raw;

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, {
      error: "Submission payload is invalid.",
      issues: parsed.error.issues.map((issue) => issue.message),
    });
  }

  const receipt = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const envelope = {
    receipt,
    retentionDays: localInbox?.retentionDays ?? retention!,
    submittedAt,
    payload: parsed.data,
  };

  if (localInbox) {
    try {
      await writeLocalSubmission(localInbox, envelope);
      return json(202, { receipt, status: "pending_review" });
    } catch {
      return json(500, { error: "Local submission inbox write failed." });
    }
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(String(process.env.DATA_SUBMISSION_WEBHOOK_URL), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.DATA_SUBMISSION_WEBHOOK_TOKEN}`,
      },
      body: JSON.stringify({
        ...envelope,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      return json(502, { error: "Submission relay failed.", receipt });
    }

    return json(202, { receipt, status: "pending_review" });
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      return json(504, { error: "Submission relay timed out.", receipt });
    }
    return json(502, { error: "Submission relay failed.", receipt });
  } finally {
    clearTimeout(timeout);
  }
}
