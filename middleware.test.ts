import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "./middleware";

describe("edge middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks Vercel preview responses as noindex", () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    const response = middleware(
      new NextRequest("https://preview.greedygrowersgame.com/"),
    );

    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("leaves production responses indexable", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    const response = middleware(
      new NextRequest("https://greedygrowersgame.com/"),
    );

    expect(response.headers.get("X-Robots-Tag")).toBeNull();
  });

  it("permanently redirects production HTTP requests to the equivalent HTTPS URL", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const request = new NextRequest(
      "http://greedygrowersgame.com/guides?source=seo",
    );

    const response = middleware(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://greedygrowersgame.com/guides?source=seo",
    );
  });

  it("does not let a forwarded-protocol header downgrade an HTTPS request", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const request = new NextRequest("https://greedygrowersgame.com/", {
      headers: { "x-forwarded-proto": "http" },
    });

    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
