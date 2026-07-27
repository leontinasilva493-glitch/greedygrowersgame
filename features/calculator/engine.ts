import type { CalculatorInput, CalculatorResult } from "./types";
import { calculatorInputSchema } from "./schema";

const EQUALITY_ULPS = 8;

function equalityTolerance(left: number, right: number): number {
  return (
    Number.EPSILON *
    EQUALITY_ULPS *
    Math.max(1, Math.abs(left), Math.abs(right))
  );
}

export function calculateHarvestDecision(
  input: CalculatorInput,
): CalculatorResult {
  const parsed = calculatorInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "invalid",
      recommendation: "NOT_ENOUGH_INPUT",
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const {
    currentValue,
    futureValue,
    lightningProbability,
    residualValue,
    waitCost,
  } = parsed.data;
  const harvestEv = currentValue;
  const waitEv =
    (1 - lightningProbability) * futureValue +
    lightningProbability * residualValue -
    waitCost;
  const waitAdvantage = waitEv - harvestEv;
  const denominator = futureValue - residualValue;
  const rawThreshold =
    denominator > 0
      ? (futureValue - waitCost - currentValue) / denominator
      : null;
  const breakEvenProbability =
    rawThreshold !== null && rawThreshold >= 0 && rawThreshold <= 1
      ? rawThreshold
      : null;
  const recommendation =
    waitAdvantage > equalityTolerance(waitEv, harvestEv)
      ? "WAIT"
      : "HARVEST_NOW";

  let reason =
    recommendation === "WAIT"
      ? "Waiting has a positive expected-value advantage."
      : "Waiting offers no expected-value advantage.";
  if (denominator <= 0) {
    reason += " Break-even probability is unavailable because risk does not change the future value.";
  } else if (breakEvenProbability === null) {
    reason += " Break-even probability is outside the usable 0 to 1 range.";
  }

  return {
    status: "valid",
    harvestEv,
    waitEv,
    waitAdvantage,
    breakEvenProbability,
    recommendation,
    reason,
  };
}
