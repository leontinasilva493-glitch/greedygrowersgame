export interface HarvestShareValues {
  currentValue: string;
  futureValue: string;
  waitSeconds: string;
  lightningRiskPercent: string;
  residualValue: string;
  waitCost: string;
}

export interface ProfitShareValues {
  attemptCost: string;
  harvestValue: string;
  failedAttempts: string;
  elapsedMinutes: string;
}

export type CalculatorShareState =
  | { tool: "harvest"; values: HarvestShareValues }
  | { tool: "profit"; values: ProfitShareValues };

const numericInputPattern = /^(?:\d+|\d*\.\d+)$/;

function readNumericValue(
  params: URLSearchParams,
  name: string,
  { optional = false }: { optional?: boolean } = {},
): string | null {
  const value = params.get(name);
  if (value === null || value.length > 32) return null;
  if (optional && value === "") return "";
  return numericInputPattern.test(value) ? value : null;
}

export function serializeCalculatorShareState(
  state: CalculatorShareState,
): string {
  const params = new URLSearchParams({ tool: state.tool, ...state.values });
  return params.toString();
}

export function parseCalculatorShareState(
  params: URLSearchParams,
): CalculatorShareState | null {
  const tool = params.get("tool");
  if (tool === "harvest") {
    const currentValue = readNumericValue(params, "currentValue");
    const futureValue = readNumericValue(params, "futureValue");
    const waitSeconds = readNumericValue(params, "waitSeconds");
    const lightningRiskPercent = readNumericValue(
      params,
      "lightningRiskPercent",
      { optional: true },
    );
    const residualValue = readNumericValue(params, "residualValue");
    const waitCost = readNumericValue(params, "waitCost");

    if (
      currentValue === null ||
      futureValue === null ||
      waitSeconds === null ||
      lightningRiskPercent === null ||
      residualValue === null ||
      waitCost === null
    ) {
      return null;
    }

    return {
      tool,
      values: {
        currentValue,
        futureValue,
        waitSeconds,
        lightningRiskPercent,
        residualValue,
        waitCost,
      },
    };
  }

  if (tool === "profit") {
    const attemptCost = readNumericValue(params, "attemptCost");
    const harvestValue = readNumericValue(params, "harvestValue");
    const failedAttempts = readNumericValue(params, "failedAttempts");
    const elapsedMinutes = readNumericValue(params, "elapsedMinutes");

    if (
      attemptCost === null ||
      harvestValue === null ||
      failedAttempts === null ||
      elapsedMinutes === null
    ) {
      return null;
    }

    return {
      tool,
      values: {
        attemptCost,
        harvestValue,
        failedAttempts,
        elapsedMinutes,
      },
    };
  }

  return null;
}
