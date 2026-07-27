export interface CalculatorInput {
  currentValue: number;
  futureValue: number;
  waitSeconds: number;
  lightningProbability: number;
  residualValue: number;
  waitCost: number;
}

export type CalculatorResult =
  | {
      status: "valid";
      harvestEv: number;
      waitEv: number;
      waitAdvantage: number;
      breakEvenProbability: number | null;
      recommendation: "HARVEST_NOW" | "WAIT";
      reason: string;
    }
  | {
      status: "invalid";
      recommendation: "NOT_ENOUGH_INPUT";
      errors: string[];
    };
