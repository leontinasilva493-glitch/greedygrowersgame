import type { DerivedProvenance, Observation } from "../data/types";

export interface SurvivalPoint extends DerivedProvenance {
  ageSeconds: number;
  atRisk: number;
  events: number;
  censored: number;
  survival: number;
  lower95: number;
  upper95: number;
  remainingAfterTime: number;
}

export type ConditionalRiskEstimate =
  | {
      available: false;
      reason: string;
    }
  | ({
      available: true;
      estimate: number;
      lower95: number;
      upper95: number;
      nAtRiskStart: number;
      nAtRiskEnd: number;
      intervalEvents: number;
    } & DerivedProvenance);

function clampProbability(value: number) {
  return Math.max(0, Math.min(1, value));
}

function computeConfidenceInterval(
  survival: number,
  greenwoodSum: number,
): Pick<SurvivalPoint, "lower95" | "upper95"> {
  if (survival >= 1) {
    return { lower95: 1, upper95: 1 };
  }

  if (survival <= 0) {
    return { lower95: 0, upper95: 0 };
  }

  const z = 1.96;
  const logSurvival = Math.log(survival);
  const logLog = Math.log(-logSurvival);
  const standardError = Math.sqrt(greenwoodSum) / Math.abs(logSurvival);
  const lower = Math.exp(-Math.exp(logLog + z * standardError));
  const upper = Math.exp(-Math.exp(logLog - z * standardError));

  return {
    lower95: clampProbability(lower),
    upper95: clampProbability(upper),
  };
}

export function buildKaplanMeierCurve(
  observations: Observation[],
): SurvivalPoint[] {
  const sorted = [...observations].sort(
    (left, right) =>
      left.exposureSeconds - right.exposureSeconds ||
      (left.event === "lightning" ? -1 : 1) -
        (right.event === "lightning" ? -1 : 1) ||
      left.id.localeCompare(right.id),
  );
  const total = sorted.length;
  let atRisk = total;
  let survival = 1;
  let greenwoodSum = 0;

  const groups = new Map<number, Observation[]>();
  for (const observation of sorted) {
    const list = groups.get(observation.exposureSeconds) ?? [];
    list.push(observation);
    groups.set(observation.exposureSeconds, list);
  }

  const points: SurvivalPoint[] = [];
  for (const [ageSeconds, group] of [...groups.entries()].sort(
    (left, right) => left[0] - right[0],
  )) {
    const events = group.filter((item) => item.event === "lightning");
    const censored = group.filter((item) => item.event === "censored");

    if (events.length > 0 && atRisk > 0) {
      survival *= 1 - events.length / atRisk;
      if (atRisk !== events.length) {
        greenwoodSum += events.length / (atRisk * (atRisk - events.length));
      } else {
        greenwoodSum = Number.POSITIVE_INFINITY;
      }
    }

    const interval =
      greenwoodSum === Number.POSITIVE_INFINITY
        ? { lower95: 0, upper95: 0 }
        : computeConfidenceInterval(survival, greenwoodSum);

    const sourceIds = [...new Set(group.map((item) => item.sourceId))];
    const observationIds = group.map((item) => item.id);
    atRisk -= group.length;

    points.push({
      ageSeconds,
      atRisk: atRisk + group.length,
      events: events.length,
      censored: censored.length,
      survival,
      remainingAfterTime: atRisk,
      lower95: interval.lower95,
      upper95: interval.upper95,
      observationIds,
      sourceIds,
      methodVersion: "kaplan-meier-v1",
      computedAt: new Date().toISOString(),
    });
  }

  return points;
}

function findPointAtAge(points: SurvivalPoint[], ageSeconds: number) {
  let previous: SurvivalPoint | null = null;
  for (const point of points) {
    if (ageSeconds < point.ageSeconds) {
      return previous;
    }
    previous = point;
  }
  return previous;
}

function survivalAtAge(points: SurvivalPoint[], ageSeconds: number) {
  return findPointAtAge(points, ageSeconds)?.survival ?? 1;
}

function lowerAtAge(points: SurvivalPoint[], ageSeconds: number) {
  return findPointAtAge(points, ageSeconds)?.lower95 ?? 1;
}

function upperAtAge(points: SurvivalPoint[], ageSeconds: number) {
  return findPointAtAge(points, ageSeconds)?.upper95 ?? 1;
}

function atRiskAtAge(points: SurvivalPoint[], ageSeconds: number) {
  const point = findPointAtAge(points, ageSeconds);
  if (!point) {
    return points[0]?.atRisk ?? 0;
  }
  return ageSeconds === point.ageSeconds ? point.atRisk : point.remainingAfterTime;
}

export function estimateConditionalRisk(
  points: SurvivalPoint[],
  currentAgeSeconds: number,
  waitSeconds: number,
): ConditionalRiskEstimate {
  if (points.length === 0) {
    return { available: false, reason: "No survival points are available yet." };
  }

  const maxObservedAge = points.at(-1)?.ageSeconds ?? 0;
  const endAgeSeconds = currentAgeSeconds + waitSeconds;

  if (
    currentAgeSeconds < 0 ||
    waitSeconds < 0 ||
    currentAgeSeconds > maxObservedAge ||
    endAgeSeconds > maxObservedAge
  ) {
    return {
      available: false,
      reason: "Requested ages fall outside the observed range.",
    };
  }

  const startSurvival = survivalAtAge(points, currentAgeSeconds);
  const endSurvival = survivalAtAge(points, endAgeSeconds);
  if (startSurvival <= 0 || endSurvival <= 0) {
    return {
      available: false,
      reason: "Conditional risk requires positive survival at both boundaries.",
    };
  }

  const startLower = lowerAtAge(points, currentAgeSeconds);
  const startUpper = upperAtAge(points, currentAgeSeconds);
  const endLower = lowerAtAge(points, endAgeSeconds);
  const endUpper = upperAtAge(points, endAgeSeconds);
  const estimate = clampProbability(1 - endSurvival / startSurvival);
  const riskLower = clampProbability(1 - endUpper / Math.max(startLower, Number.EPSILON));
  const riskUpper = clampProbability(1 - endLower / Math.max(startUpper, Number.EPSILON));
  const intervalEvents = points
    .filter((point) => point.ageSeconds > currentAgeSeconds && point.ageSeconds <= endAgeSeconds)
    .reduce((sum, point) => sum + point.events, 0);
  const provenancePoints = points.filter(
    (point) => point.ageSeconds >= currentAgeSeconds && point.ageSeconds <= endAgeSeconds,
  );

  return {
    available: true,
    estimate,
    lower95: Math.min(riskLower, riskUpper),
    upper95: Math.max(riskLower, riskUpper),
    nAtRiskStart: atRiskAtAge(points, currentAgeSeconds),
    nAtRiskEnd: atRiskAtAge(points, endAgeSeconds),
    intervalEvents,
    observationIds: provenancePoints.flatMap((point) => point.observationIds ?? []),
    sourceIds: [...new Set(provenancePoints.flatMap((point) => point.sourceIds))],
    methodVersion: "kaplan-meier-v1",
    computedAt: new Date().toISOString(),
  };
}
