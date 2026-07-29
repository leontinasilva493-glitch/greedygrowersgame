import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

type WranglerConfig = {
  name?: string;
  assets?: { binding?: string; directory?: string };
  images?: { binding?: string };
  services?: Array<{ binding?: string; service?: string }>;
  r2_buckets?: Array<{ binding?: string; bucket_name?: string }>;
};

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8")) as T;

describe("Cloudflare deployment configuration", () => {
  it("uses the same deployment identity for npm, Wrangler, and the self-reference binding", () => {
    const packageJson = readJson<{ name?: string }>("./package.json");

    expect(packageJson.name).toBe("greedygrowersgame");

    const wrangler = readJson<WranglerConfig>("./wrangler.jsonc");
    const selfReference = wrangler.services?.find(
      ({ binding }) => binding === "WORKER_SELF_REFERENCE",
    );

    expect(wrangler.name).toBe(packageJson.name);
    expect(selfReference?.service).toBe(wrangler.name);
  });

  it("declares the OpenNext production bindings and reuses the existing cache bucket", () => {
    const wrangler = readJson<WranglerConfig>("./wrangler.jsonc");
    const incrementalCache = wrangler.r2_buckets?.find(
      ({ binding }) => binding === "NEXT_INC_CACHE_R2_BUCKET",
    );

    expect(wrangler.assets).toEqual({
      binding: "ASSETS",
      directory: ".open-next/assets",
    });
    expect(wrangler.images?.binding).toBe("IMAGES");
    expect(incrementalCache?.bucket_name).toBe(
      "greedygrowerscalculator-opennext-cache",
    );
  });
});
