import { readFile } from "node:fs/promises";
import path from "node:path";

import { sourcesSchema } from "../features/data/schemas";
import {
  evaluatePhaseZeroEvidence,
  evidenceManifestSchema,
} from "../features/evidence/manifest";

async function main() {
  const manifestPath = path.join(
    process.cwd(),
    "research",
    "evidence-manifest.json",
  );
  const manifest = evidenceManifestSchema.parse(
    JSON.parse(await readFile(manifestPath, "utf8")),
  );
  const sources = sourcesSchema.parse(
    JSON.parse(
      await readFile(path.join(process.cwd(), "data", "sources.json"), "utf8"),
    ),
  );
  const gate = evaluatePhaseZeroEvidence(manifest, {
    officialSourceIds: sources
      .filter((source) => source.type === "official")
      .map((source) => source.id),
  });

  console.log(
    `Phase 0 evidence gate: ${gate.ready ? "OPEN" : "CLOSED"} (${gate.approvedRequiredCount}/5 required recordings approved).`,
  );
  if (!gate.ready) {
    console.log(gate.reasons.join("\n"));
  }
}

void main();
