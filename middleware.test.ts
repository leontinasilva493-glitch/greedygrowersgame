import { afterEach, describe, expect, it, vi } from "vitest";

import { middleware } from "./middleware";

describe("edge middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks Vercel preview responses as noindex", () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    const response = middleware();

    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("leaves production responses indexable", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    const response = middleware();

    expect(response.headers.get("X-Robots-Tag")).toBeNull();
  });
});
