import { describe, expect, it } from "vitest";

import {
  assertBrandSafeCopy,
  createSiteConfig,
  OFFICIAL_ROBLOX_GAME_URL,
} from "./site";

describe("createSiteConfig", () => {
  it("uses the explicit localhost origin outside production", () => {
    const config = createSiteConfig({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });

    expect(config.origin).toBe("http://localhost:3000");
  });

  it("falls back to localhost outside production", () => {
    const config = createSiteConfig({});

    expect(config.origin).toBe("http://localhost:3000");
  });

  it.each([
    { NODE_ENV: "production" },
    { VERCEL_ENV: "production" },
  ])("uses the official domain when production has no URL override", (environment) => {
    expect(createSiteConfig(environment).origin).toBe(
      "https://greedygrowersgame.com",
    );
  });

  it("requires HTTPS in Vercel production", () => {
    expect(() =>
      createSiteConfig({
        VERCEL_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "http://greedygrowers.example",
      }),
    ).toThrow(/must use HTTPS/i);
  });

  it("normalizes a valid production origin", () => {
    const config = createSiteConfig({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://greedygrowers.example/",
    });

    expect(config.origin).toBe("https://greedygrowers.example");
  });

  it("rejects origins containing a path, query, hash, or credentials", () => {
    for (const value of [
      "https://example.com/tools",
      "https://example.com/?preview=1",
      "https://example.com/#top",
      "https://user:pass@example.com",
    ]) {
      expect(() =>
        createSiteConfig({ NEXT_PUBLIC_SITE_URL: value }),
      ).toThrow(/must be an origin/i);
    }
  });

  it("uses verified Roblox configuration and no fake support address", () => {
    const config = createSiteConfig({});

    expect(config.robloxGameUrl).toBe(OFFICIAL_ROBLOX_GAME_URL);
    expect(config.supportEmail).toBeNull();
  });

  it("uses the approved calculator-first homepage metadata", () => {
    const config = createSiteConfig({});

    expect(config.title).toBe(
      "Greedy Growers Calculator: Harvest Now or Wait?",
    );
    expect(config.description).toBe(
      "Use the Greedy Growers Calculator to compare harvest value, wait value, and lightning risk, see the break-even point, and decide whether to harvest or wait.",
    );
  });

  it("rejects an invalid configured support email", () => {
    expect(() =>
      createSiteConfig({ NEXT_PUBLIC_SUPPORT_EMAIL: "support.example.com" }),
    ).toThrow(/support email/i);
  });

  it("rejects old-brand copy", () => {
    expect(() => assertBrandSafeCopy("Crazy Cattle portal")).toThrow(
      /legacy brand/i,
    );
    expect(() => assertBrandSafeCopy("Play games Unblocked")).toThrow(
      /legacy brand/i,
    );
  });
});
