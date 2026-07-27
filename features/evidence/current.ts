import rawEvidenceManifest from "../../research/evidence-manifest.json";

import { evaluatePhaseZeroEvidence, evidenceManifestSchema } from "./manifest";

export const currentEvidenceManifest = evidenceManifestSchema.parse(
  rawEvidenceManifest,
);

export const currentPhaseZeroEvidenceGate = evaluatePhaseZeroEvidence(
  currentEvidenceManifest,
);
