export interface CalculatorInput {
  currentValue: number;
  futureValue: number;
  waitSeconds: number;
  lightningProbability: number;
  residualValue: number;
  waitCost: number;
}

export interface HarvestThresholdInput {
  currentValue: number;
  futureValue: number;
  residualValue: number;
  waitCost: number;
}

export type HarvestThresholdResult =
  | {
      status: "valid";
      harvestEv: number;
      waitEvAtZeroRisk: number;
      breakEvenProbability: number | null;
      canWaitingBeatHarvest: boolean;
    }
  | {
      status: "invalid";
      errors: string[];
    };

export interface ObservedRunInput {
  attemptCost: number;
  harvestValue: number;
  failedAttempts: number;
  elapsedMinutes: number;
}

export type ObservedRunResult =
  | {
      status: "valid";
      outcome: "PROFITABLE" | "BREAK_EVEN" | "LOSS";
      attempts: number;
      totalCost: number;
      cleanProfit: number;
      netAfterFailures: number;
      netPerMinute: number;
      cleanRoiPercent: number | null;
      breakEvenHarvest: number;
      recoverableFailedAttempts: number | null;
    }
  | {
      status: "invalid";
      errors: string[];
    };

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
