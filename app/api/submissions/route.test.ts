import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { POST } from "./route";

const payload = {
  submissionType: "observation",
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
  website: "",
};
const temporaryDirectories: string[] = [];

function request(body: unknown, headers?: HeadersInit) {
  return new Request("http://localhost/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.DATA_SUBMISSION_WEBHOOK_URL;
  delete process.env.DATA_SUBMISSION_WEBHOOK_TOKEN;
  delete process.env.MODERATION_INBOX_DRIVER;
  delete process.env.SUBMISSION_RETENTION_DAYS;
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("POST /api/submissions", () => {
  it("returns 503 while the moderation inbox is unavailable", async () => {
    expect((await POST(request(payload))).status).toBe(503);
  });

  it("generates a receipt before sending the pending payload", async () => {
    process.env.DATA_SUBMISSION_WEBHOOK_URL = "https://example.org/inbox";
    process.env.DATA_SUBMISSION_WEBHOOK_TOKEN = "test-token";
    process.env.SUBMISSION_RETENTION_DAYS = "90";
    const send = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", send);

    const response = await POST(request(payload));
    const result = (await response.json()) as { receipt: string };
    const sent = JSON.parse(String(send.mock.calls[0][1]?.body)) as { receipt: string };

    expect(response.status).toBe(202);
    expect(result.receipt).toMatch(/^[0-9a-f-]{36}$/);
    expect(sent.receipt).toBe(result.receipt);
    expect(send.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: "Bearer test-token",
    });
  });

  it("stores a private pending record with the local file driver outside production", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "greedy-route-inbox-"));
    temporaryDirectories.push(directory);
    vi.spyOn(process, "cwd").mockReturnValue(directory);
    process.env.MODERATION_INBOX_DRIVER = "file";
    process.env.SUBMISSION_RETENTION_DAYS = "30";

    const response = await POST(request(payload));
    const result = (await response.json()) as { receipt: string };
    const stored = JSON.parse(
      await readFile(
        path.join(
          directory,
          ".local-data",
          "moderation",
          "records",
          `${result.receipt}.json`,
        ),
        "utf8",
      ),
    ) as { status: string; payload: unknown };

    expect(response.status).toBe(202);
    expect(stored.status).toBe("pending_review");
    expect(stored.payload).toMatchObject(payload);
  });

  it("rejects declared oversized requests before parsing", async () => {
    const response = await POST(request(payload, { "content-length": "20000" }));
    expect(response.status).toBe(413);
  });

  it("stops streaming an undeclared oversized body before calling request.text", async () => {
    process.env.DATA_SUBMISSION_WEBHOOK_URL = "https://example.org/inbox";
    process.env.DATA_SUBMISSION_WEBHOOK_TOKEN = "test-token";
    process.env.SUBMISSION_RETENTION_DAYS = "90";
    const text = vi.fn().mockRejectedValue(new Error("must not buffer the body"));
    const oversized = {
      headers: new Headers({ "content-type": "application/json" }),
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(16 * 1024 + 1));
          controller.close();
        },
      }),
      text,
    } as unknown as Request;

    const response = await POST(oversized);

    expect(response.status).toBe(413);
    expect(text).not.toHaveBeenCalled();
  });

  it("distinguishes a moderation timeout from a relay rejection", async () => {
    process.env.DATA_SUBMISSION_WEBHOOK_URL = "https://example.org/inbox";
    process.env.DATA_SUBMISSION_WEBHOOK_TOKEN = "test-token";
    process.env.SUBMISSION_RETENTION_DAYS = "90";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")),
    );

    const response = await POST(request(payload));
    const result = (await response.json()) as { receipt: string };
    expect(response.status).toBe(504);
    expect(result.receipt).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns the receipt when the relay rejects after it may have accepted the payload", async () => {
    process.env.DATA_SUBMISSION_WEBHOOK_URL = "https://example.org/inbox";
    process.env.DATA_SUBMISSION_WEBHOOK_TOKEN = "test-token";
    process.env.SUBMISSION_RETENTION_DAYS = "90";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    const response = await POST(request(payload));
    const result = (await response.json()) as { receipt: string };

    expect(response.status).toBe(502);
    expect(result.receipt).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("maps the AbortError produced by AbortController to a timeout", async () => {
    process.env.DATA_SUBMISSION_WEBHOOK_URL = "https://example.org/inbox";
    process.env.DATA_SUBMISSION_WEBHOOK_TOKEN = "test-token";
    process.env.SUBMISSION_RETENTION_DAYS = "90";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")),
    );

    const response = await POST(request(payload));
    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toMatchObject({
      receipt: expect.stringMatching(/^[0-9a-f-]{36}$/),
    });
  });
});
