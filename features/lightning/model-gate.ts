import { selectModelEligibleObservations } from "../data/eligibility";
import type { DerivedProvenance, Observation, Source } from "../data/types";

import { buildKaplanMeierCurve, estimateConditionalRisk } from "./kaplan-meier";

export const QUERY_GATE = {
  minAtRiskStart: 20,
  minAtRiskEnd: 10,
  minIntervalEvents: 3,
  maxWidth95: 0.3,
} as const;

export const CONFIDENCE_THRESHOLDS = {
  low: {
    minimumObservations: 100,
    minimumEvents: 20,
    minimumSessions: 10,
  },
  medium: {
    minimumObservations: 300,
    minimumEvents: 60,
    minimumSessions: 30,
  },
} as const;

export interface ModelEligibility extends DerivedProvenance {
  eligible: boolean;
  confidence: "low" | "medium" | "high";
  reasons: string[];
  observationCount: number;
  sessionCount: number;
  eventCount: number;
  censoredCount: number;
  gameVersion: string;
}

export type CommunityDecision =
  | {
      available: false;
      reasons: string[];
    }
  | ({
      available: true;
      decision: CommunityDecisionState;
      reasons: string[];
      breakEvenProbability: number;
      estimate: number;
      lower95: number;
      upper95: number;
      nAtRiskStart: number;
      nAtRiskEnd: number;
      intervalEvents: number;
    } & DerivedProvenance);

type CommunityDecisionState = "WAIT" | "HARVEST_NOW" | "MODEL_UNCERTAIN";

function resolveConfidence({
  eventCount,
  observationCount,
  sessionCount,
}: {
  eventCount: number;
  observationCount: number;
  sessionCount: number;
}) {
  if (
    observationCount < CONFIDENCE_THRESHOLDS.low.minimumObservations ||
    eventCount < CONFIDENCE_THRESHOLDS.low.minimumEvents ||
    sessionCount < CONFIDENCE_THRESHOLDS.low.minimumSessions
  ) {
    return "low" as const;
  }

  if (
    observationCount < CONFIDENCE_THRESHOLDS.medium.minimumObservations ||
    eventCount < CONFIDENCE_THRESHOLDS.medium.minimumEvents ||
    sessionCount < CONFIDENCE_THRESHOLDS.medium.minimumSessions
  ) {
    return "medium" as const;
  }

  return "high" as const;
}

export function evaluateModelEligibility({
  currentVersion,
  observations,
  sources,
}: {
  currentVersion: string;
  observations: Observation[];
  sources: Source[];
}): ModelEligibility {
  const selected = selectModelEligibleObservations(
    observations,
    sources,
    currentVersion,
  );
  const eventCount = selected.filter((item) => item.event === "lightning").length;
  const censoredCount = selected.filter((item) => item.event === "censored").length;
  const sessionCount = new Set(selected.map((item) => item.serverSessionId)).size;
  const reasons: string[] = [];

  if (currentVersion === "unverified") {
    reasons.push("The current game version is still unverified.");
  }
  if (selected.length < 30) {
    reasons.push("Need at least 30 approved observations from independent sessions.");
  }
  if (sessionCount < 30) {
    reasons.push("Need at least 30 independent server sessions.");
  }
  if (eventCount < 5) {
    reasons.push("Need at least 5 lightning events.");
  }
  if (censoredCount < 5) {
    reasons.push("Need at least 5 planned-stop censored observations.");
  }

  return {
    eligible: reasons.length === 0,
    confidence: resolveConfidence({
      eventCount,
      observationCount: selected.length,
      sessionCount,
    }),
    reasons,
    observationCount: selected.length,
    sessionCount,
    eventCount,
    censoredCount,
    gameVersion: currentVersion,
    observationIds: selected.map((item) => item.id),
    sourceIds: [...new Set(selected.map((item) => item.sourceId))],
    methodVersion: "community-risk-v1",
    computedAt: new Date().toISOString(),
  };
}

export function evaluateRiskQuery({
  breakEvenProbability,
  currentAgeSeconds,
  currentVersion,
  observations,
  sources,
  waitSeconds,
}: {
  breakEvenProbability: number;
  currentAgeSeconds: number;
  currentVersion: string;
  observations: Observation[];
  sources: Source[];
  waitSeconds: number;
}): CommunityDecision {
  const eligibility = evaluateModelEligibility({
    currentVersion,
    observations,
    sources,
  });
  if (!eligibility.eligible) {
    return { available: false, reasons: eligibility.reasons };
  }

  const curve = buildKaplanMeierCurve(
    selectModelEligibleObservations(observations, sources, currentVersion),
  );
  const estimate = estimateConditionalRisk(curve, currentAgeSeconds, waitSeconds);
  if (!estimate.available) {
    return { available: false, reasons: [estimate.reason] };
  }

  const reasons: string[] = [];
  if (estimate.nAtRiskStart < QUERY_GATE.minAtRiskStart) {
    reasons.push(
      `Need at least ${QUERY_GATE.minAtRiskStart} trees at risk at the interval start.`,
    );
  }
  if (estimate.nAtRiskEnd < QUERY_GATE.minAtRiskEnd) {
    reasons.push(
      `Need at least ${QUERY_GATE.minAtRiskEnd} trees at risk at the interval end.`,
    );
  }
  if (estimate.intervalEvents < QUERY_GATE.minIntervalEvents) {
    reasons.push(
      `Need at least ${QUERY_GATE.minIntervalEvents} interval lightning events.`,
    );
  }
  if (estimate.upper95 - estimate.lower95 > QUERY_GATE.maxWidth95) {
    reasons.push("The 95% diagnostic interval is still too wide.");
  }
  if (reasons.length > 0) {
    return { available: false, reasons };
  }

  let decision: CommunityDecisionState = "MODEL_UNCERTAIN";
  if (estimate.upper95 < breakEvenProbability) {
    decision = "WAIT";
  } else if (estimate.lower95 >= breakEvenProbability) {
    decision = "HARVEST_NOW";
  }

  return {
    available: true,
    decision,
    reasons: [],
    breakEvenProbability,
    estimate: estimate.estimate,
    lower95: estimate.lower95,
    upper95: estimate.upper95,
    nAtRiskStart: estimate.nAtRiskStart,
    nAtRiskEnd: estimate.nAtRiskEnd,
    intervalEvents: estimate.intervalEvents,
    observationIds: estimate.observationIds,
    sourceIds: estimate.sourceIds,
    methodVersion: "community-risk-v1",
    computedAt: new Date().toISOString(),
  };
}
