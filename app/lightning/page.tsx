import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { SurvivalCurve } from "@/components/charts/SurvivalCurve";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataRepository } from "@/features/data/repository";
import { buildKaplanMeierCurve, estimateConditionalRisk } from "@/features/lightning/kaplan-meier";
import { evaluateModelEligibility } from "@/features/lightning/model-gate";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getPageIndexability } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title: "Greedy Growers Lightning Evidence",
    description:
      "Current-version lightning observations, model gates, and survival diagnostics for Greedy Growers.",
    canonical: "/lightning",
    route: "/lightning",
    snapshot: await getIndexabilitySnapshot(),
  });
}

export default async function LightningPage() {
  const [observations, sources, gameVersion, seoSnapshot] = await Promise.all([
    dataRepository.getObservations(),
    dataRepository.getSources(),
    dataRepository.getCurrentGameVersion(),
    getIndexabilitySnapshot(),
  ]);

  const eligibility = evaluateModelEligibility({
    currentVersion: gameVersion.version,
    observations,
    sources,
  });
  const curve = seoSnapshot.phaseZeroEvidenceReady && eligibility.eligible
    ? buildKaplanMeierCurve(
        observations.filter((observation) =>
          eligibility.observationIds?.includes(observation.id),
        ),
      )
    : [];
  const sampleQuery =
    curve.length > 0
      ? estimateConditionalRisk(curve, curve[0].ageSeconds, 30)
      : { available: false as const, reason: "Model gate is closed." };
  const pageGate = getPageIndexability("/lightning", seoSnapshot);

  return (
    <ContentPage
      eyebrow="Lightning / Community evidence"
      title="Lightning risk stays evidence-gated"
      description="This page separates confirmed mechanics, raw observation counts, and model-based interval diagnostics. No official strike chance is claimed."
      status={`Current version: ${gameVersion.version}. Page is ${pageGate.index ? "index" : "noindex"}: ${pageGate.reason}`}
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Approved observations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-foreground">
              {eligibility.observationCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              One analysis-eligible tree per server session, current version only.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lightning events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-foreground">
              {eligibility.eventCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Planned-stop censoring is tracked separately from lightning hits.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Model confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-foreground">
              {eligibility.confidence.toUpperCase()}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Confidence reflects sample coverage, not official certainty.
            </p>
          </CardContent>
        </Card>
      </section>

      <ContentSection title="Model gate">
        {eligibility.eligible ? (
          <p>
            The global community model is open for this exact game version. Any
            query still needs its own interval gate before we show a risk range.
          </p>
        ) : (
          <div className="space-y-2">
            <p>The probability display gate is still closed.</p>
            <ul className="grid gap-2 pl-5 marker:text-lightning">
              {eligibility.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        <EvidenceNote>
          Community evidence never replaces your custom risk input on the
          calculator. When uncertainty crosses break-even, the correct output is
          <strong> MODEL_UNCERTAIN</strong>.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Sample interval diagnostic">
        {sampleQuery.available ? (
          <p>
            Example 30-second interval from the first observed point:{" "}
            {(sampleQuery.estimate * 100).toFixed(2)}% risk with a 95% range of{" "}
            {(sampleQuery.lower95 * 100).toFixed(2)}% to{" "}
            {(sampleQuery.upper95 * 100).toFixed(2)}%.
          </p>
        ) : (
          <p>{sampleQuery.reason}</p>
        )}
      </ContentSection>

      {curve.length > 0 ? (
        <div className="mt-8">
          <SurvivalCurve points={curve} />
        </div>
      ) : null}

      <ContentSection title="Reporting guidance">
        <p>
          To unlock better diagnostics, record a tree from planting start, set a
          planned stop time in advance, and keep one analysis submission per
          server session.
        </p>
        <div className="mt-4">
          <InlineCta href="/">Open the calculator</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
