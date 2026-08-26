import { describe, expect, it } from "vitest";

import {
  parseCalculatorShareState,
  serializeCalculatorShareState,
  type CalculatorShareState,
} from "./share-state";

describe("calculator share state", () => {
  it.each<CalculatorShareState>([
    {
      tool: "harvest",
      values: {
        currentValue: "100",
        futureValue: "240",
        waitSeconds: "12",
        lightningRiskPercent: "18.5",
        residualValue: "0",
        waitCost: "5",
      },
    },
    {
      tool: "profit",
      values: {
        attemptCost: "100",
        harvestValue: "600",
        failedAttempts: "2",
        elapsedMinutes: "10",
      },
    },
  ])("round-trips $tool calculator values", (state) => {
    const query = serializeCalculatorShareState(state);

    expect(parseCalculatorShareState(new URLSearchParams(query))).toEqual(state);
  });

  it("rejects unrecognized or unsafe numeric input", () => {
    expect(
      parseCalculatorShareState(
        new URLSearchParams("tool=profit&attemptCost=alert(1)"),
      ),
    ).toBeNull();
  });
});
