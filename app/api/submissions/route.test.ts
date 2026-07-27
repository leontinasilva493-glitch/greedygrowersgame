import { afterEach, describe, expect, it, vi } from "vitest";

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

function request(body: unknown, headers?: HeadersInit) {
  return new Request("http://localhost/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.DATA_SUBMISSION_WEBHOOK_URL;
  delete process.env.DATA_SUBMISSION_WEBHOOK_TOKEN;
  delete process.env.SUBMISSION_RETENTION_DAYS;
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

    expect((await POST(request(payload))).status).toBe(504);
  });

  it("maps the AbortError produced by AbortController to a timeout", async () => {
    process.env.DATA_SUBMISSION_WEBHOOK_URL = "https://example.org/inbox";
    process.env.DATA_SUBMISSION_WEBHOOK_TOKEN = "test-token";
    process.env.SUBMISSION_RETENTION_DAYS = "90";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")),
    );

    expect((await POST(request(payload))).status).toBe(504);
  });
});
