import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const state = vi.hoisted(() => ({ pathname: "/", consent: "unset", effects: [] as (() => unknown)[] }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useEffect: (effect: () => unknown) => state.effects.push(effect),
  useSyncExternalStore: () => state.consent,
}));
import { AdsterraPopunder } from "./AdsterraPopunder";

afterEach(() => { vi.unstubAllGlobals(); state.effects = []; state.pathname = "/"; state.consent = "unset"; });

function run(existing = false) {
  const script = { id: "", src: "", async: false, setAttribute: vi.fn() };
  const append = vi.fn();
  const reload = vi.fn();
  vi.stubGlobal("document", { getElementById: () => existing ? script : null, createElement: () => script, head: { append } });
  vi.stubGlobal("window", { location: { reload } });
  renderToStaticMarkup(<AdsterraPopunder />);
  state.effects.forEach(effect => effect());
  return { script, append, reload };
}

describe("Adsterra Popunder lifecycle", () => {
  it("loads automatically without consent", () => { expect(run().append).toHaveBeenCalledOnce(); });
  it("loads the approved script into head", () => {
    state.consent = "granted";
    const result = run();
    expect(result.append).toHaveBeenCalledOnce();
    expect(result.script.src).toBe("https://pl31199200.profitableratecpmnetwork.com/5a/57/ca/5a57ca988bdaec73c17f829159e9fab5.js");
  });
  it("does not duplicate the script on content navigation", () => {
    state.consent = "granted";
    expect(run(true).append).not.toHaveBeenCalled();
  });
  it("does not load on legal pages", () => {
    state.consent = "granted"; state.pathname = "/privacy";
    expect(run().append).not.toHaveBeenCalled();
  });
  it("ignores old analytics opt-out choices for advertising", () => {
    state.consent = "denied";
    expect(run().append).toHaveBeenCalledOnce();
  });
  it("clears existing handlers when entering an ad-free page", () => {
    state.consent = "granted"; state.pathname = "/terms";
    expect(run(true).reload).toHaveBeenCalledOnce();
  });
});
