import { afterEach, describe, expect, it, vi } from "vitest";

describe("analytics consent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("loads Microsoft Clarity only after analytics consent is granted", async () => {
    const storage = new Map<string, string>();
    const appendedScripts: Array<Record<string, unknown>> = [];

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("document", {
      querySelector: vi.fn(() => null),
      createElement: vi.fn(() => ({ dataset: {} })),
      head: {
        append: (script: Record<string, unknown>) => appendedScripts.push(script),
      },
    });
    vi.stubGlobal(
      "CustomEvent",
      class {
        constructor(
          public type: string,
          public init?: { detail?: unknown },
        ) {}
      },
    );

    const { setAnalyticsConsent } = await import("./events");

    expect(appendedScripts).toHaveLength(0);

    setAnalyticsConsent(true);

    expect(appendedScripts).toHaveLength(1);
    expect(appendedScripts[0]).toMatchObject({
      async: true,
      src: "https://www.clarity.ms/tag/y8aj6ax98g",
      dataset: { greedyClarity: "y8aj6ax98g" },
    });
  });
});
