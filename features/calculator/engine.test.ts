import { describe, expect, it } from "vitest";

import { calculateHarvestDecision } from "./engine";

const baseInput = {
  currentValue: 100,
  futureValue: 200,
  waitSeconds: 30,
  lightningProbability: 0.5,
  residualValue: 0,
  waitCost: 0,
};

describe("calculateHarvestDecision", () => {
  it("uses the exact EV formula and harvests at equality", () => {
    expect(calculateHarvestDecision(baseInput)).toMatchObject({
      status: "valid",
      harvestEv: 100,
      waitEv: 100,
      waitAdvantage: 0,
      breakEvenProbability: 0.5,
      recommendation: "HARVEST_NOW",
    });
  });

  it.each([
    [0.49, "WAIT"],
    [0.51, "HARVEST_NOW"],
    [0, "WAIT"],
    [1, "HARVEST_NOW"],
  ] as const)("returns %s risk recommendation %s", (risk, recommendation) => {
    expect(
      calculateHarvestDecision({ ...baseInput, lightningProbability: risk }),
    ).toMatchObject({ status: "valid", recommendation });
  });

  it("includes residual value and wait cost in EV and break-even", () => {
    expect(
      calculateHarvestDecision({
        ...baseInput,
        lightningProbability: 0.25,
        residualValue: 40,
        waitCost: 20,
      }),
    ).toMatchObject({
      status: "valid",
      harvestEv: 100,
      waitEv: 140,
      waitAdvantage: 40,
      breakEvenProbability: 0.5,
      recommendation: "WAIT",
    });
  });

  it("returns no threshold when waiting loses even at zero risk", () => {
    expect(
      calculateHarvestDecision({
        ...baseInput,
        currentValue: 150,
        futureValue: 140,
      }),
    ).toMatchObject({
      status: "valid",
      breakEvenProbability: null,
      recommendation: "HARVEST_NOW",
    });
  });

  it("returns no threshold when residual equals future value", () => {
    expect(
      calculateHarvestDecision({
        ...baseInput,
        residualValue: 200,
      }),
    ).toMatchObject({
      status: "valid",
      breakEvenProbability: null,
    });
  });

  it.each([
    ["probability below zero", { lightningProbability: -0.01 }],
    ["probability above one", { lightningProbability: 1.01 }],
    ["NaN", { currentValue: Number.NaN }],
    ["Infinity", { futureValue: Number.POSITIVE_INFINITY }],
    ["negative value", { waitCost: -1 }],
    ["unsafe value", { currentValue: Number.MAX_SAFE_INTEGER + 1 }],
    ["residual above future", { residualValue: 201 }],
  ])("rejects %s", (_label, change) => {
    const result = calculateHarvestDecision({ ...baseInput, ...change });
    expect(result).toMatchObject({
      status: "invalid",
      recommendation: "NOT_ENOUGH_INPUT",
    });
    if (result.status === "invalid") {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("accepts Number.MAX_SAFE_INTEGER", () => {
    expect(
      calculateHarvestDecision({
        ...baseInput,
        currentValue: Number.MAX_SAFE_INTEGER,
        futureValue: Number.MAX_SAFE_INTEGER,
      }),
    ).toMatchObject({ status: "valid", recommendation: "HARVEST_NOW" });
  });

  it("flips immediately on either side of break-even", () => {
    const below = calculateHarvestDecision({
      ...baseInput,
      lightningProbability: 0.5 - 1e-10,
    });
    const above = calculateHarvestDecision({
      ...baseInput,
      lightningProbability: 0.5 + 1e-10,
    });

    expect(below).toMatchObject({ status: "valid", recommendation: "WAIT" });
    expect(above).toMatchObject({
      status: "valid",
      recommendation: "HARVEST_NOW",
    });
  });
});
