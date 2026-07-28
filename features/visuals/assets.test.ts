import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { gameSceneAssets } from "./assets";

const projectRoot = resolve(import.meta.dirname, "../..");

describe("gameSceneAssets", () => {
  it("keeps one owned local illustration for every target route", () => {
    expect(Object.keys(gameSceneAssets).sort()).toEqual([
      "beginner",
      "home",
      "lightning",
      "seeds",
    ]);

    for (const asset of Object.values(gameSceneAssets)) {
      expect(asset.src).toMatch(/^\/media\/greedy-growers\/scenes\/.+\.webp$/);
      expect(existsSync(resolve(projectRoot, "public", asset.src.slice(1)))).toBe(
        true,
      );
      expect(asset.alt.trim().length).toBeGreaterThan(20);
      expect(asset.caption).toContain("Not gameplay footage");
      expect(asset.rightsStatus).toBe("owned");
      expect(`${asset.src} ${asset.rightsNote}`).not.toMatch(
        /rbxcdn|greedygrowers\.codes|greedygrowers\.wiki/i,
      );
    }
  });
});
