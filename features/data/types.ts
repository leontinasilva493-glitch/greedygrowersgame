export type DataStatus =
  | "verified"
  | "observed"
  | "estimated"
  | "conflicting"
  | "unknown"
  | "needs_recheck";

export type ReviewState = "pending" | "approved" | "rejected";
export type ObservationEvent = "lightning" | "censored";
export type CensorReason =
  | "planned_stop"
  | "session_ended"
  | "lost_to_followup"
  | "harvested";
export type ObservationProtocol = "precommitted_window" | "opportunistic";

export interface SeedFact {
  key: string;
  value: string;
  sourceIds: string[];
}

export interface Seed {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  imageSourceId?: string;
  rarity?: string;
  acquisition?: string;
  cost?: number;
  currency?: string;
  facts: SeedFact[];
  status: DataStatus;
  gameVersion: string;
  lastVerified: string;
  sourceIds: string[];
  indexing: "index" | "noindex";
  indexingReason: string;
}

export interface Observation {
  id: string;
  seedId?: string;
  treeInstanceId: string;
  serverSessionId: string;
  gameVersion: string;
  startedAt: string;
  endedAt: string;
  treeAgeAtStartSeconds: number;
  treeAgeAtEndSeconds: number;
  exposureSeconds: number;
  plannedStopSeconds?: number;
  observationProtocol: ObservationProtocol;
  event: ObservationEvent;
  censorReason?: CensorReason;
  residualValue?: number;
  sourceId: string;
  evidenceUrl: string;
  status: DataStatus;
  reviewState: ReviewState;
  reviewedAt?: string;
  lastVerified: string;
  notes?: string;
}

export interface GrowthMeasurement {
  id: string;
  seedId: string;
  treeInstanceId: string;
  serverSessionId: string;
  gameVersion: string;
  treeAgeSeconds: number;
  value: number;
  currency: string;
  observedAt: string;
  sourceId: string;
  evidenceUrl: string;
  status: DataStatus;
  reviewState: ReviewState;
  reviewedAt?: string;
  lastVerified: string;
}

export interface Source {
  id: string;
  type: "official" | "gameplay" | "community" | "editorial";
  title: string;
  url: string;
  capturedAt: string;
  gameVersion?: string;
  notes?: string;
}

export interface GameVersion {
  version: string;
  checkedAt: string;
  sourceIds: string[];
}

export interface CodeEntry {
  code: string;
  reward?: string;
  sourceIds: string[];
  checkedAt: string;
}

export interface CodesDataset {
  redeemUiVerified: boolean;
  lastChecked: string;
  active: CodeEntry[];
  expired: CodeEntry[];
  sourceIds: string[];
}

export interface Update {
  id: string;
  type: "game" | "data";
  publishedAt: string;
  gameVersion: string;
  summary: string;
  sourceIds: string[];
  invalidatesPriorData: boolean;
  status: DataStatus;
  reviewState: ReviewState;
}

export interface DataChange {
  id: string;
  changedAt: string;
  recordIds: string[];
  sourceIds: string[];
  reviewer: string;
  summary: string;
  methodVersion: string;
}

export interface DerivedProvenance {
  observationIds?: string[];
  measurementIds?: string[];
  sourceIds: string[];
  methodVersion: string;
  computedAt: string;
}
