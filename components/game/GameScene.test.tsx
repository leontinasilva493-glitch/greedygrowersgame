import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { gameSceneAssets } from "@/features/visuals/assets";

import { GameScene } from "./GameScene";

describe("GameScene", () => {
  it("renders a local, labelled illustration with stable image dimensions", () => {
    const markup = renderToStaticMarkup(
      createElement(GameScene, {
        asset: gameSceneAssets.home,
        preload: true,
        compact: true,
      }),
    );

    expect(markup).toContain("data-game-scene");
    expect(markup).toContain("Fan-made illustration");
    expect(markup).toContain(gameSceneAssets.home.alt);
    expect(markup).toContain(gameSceneAssets.home.caption);
    expect(markup).toContain('width="1536"');
    expect(markup).toContain('height="1024"');
    expect(markup).toContain("(max-width: 640px) 100vw");
    expect(markup).not.toMatch(/rbxcdn|greedygrowers\.codes|greedygrowers\.wiki/i);
  });
});
