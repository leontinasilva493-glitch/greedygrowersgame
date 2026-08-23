"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Clipboard,
  Link2,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";

import { Analytics } from "../analytics/Analytics";
import { AnalyticsConsent } from "../analytics/AnalyticsConsent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { track } from "../../features/analytics/events";
import {
  calculateHarvestDecision,
  calculateHarvestThreshold,
} from "../../features/calculator/engine";
import { calculateObservedRun } from "../../features/calculator/run-engine";
import {
  parseCalculatorShareState,
  serializeCalculatorShareState,
  type HarvestShareValues,
  type ProfitShareValues,
} from "../../features/calculator/share-state";
import type {
  CalculatorResult,
  HarvestThresholdResult,
  ObservedRunResult,
} from "../../features/calculator/types";
import { CalculatorStatusStrip } from "./CalculatorStatusStrip";
import { ProfitResultCard } from "./ProfitResultCard";
import { RecommendationCard } from "./RecommendationCard";

type CalculatorTool = "harvest" | "profit";

interface SavedScenario {
  id: string;
  label: string;
  tool: CalculatorTool;
  primary: string;
  secondary: string;
}

const SESSION_STORAGE_KEY = "greedy-growers-scenarios-v1";

const emptyHarvestValues: HarvestShareValues = {
  currentValue: "",
  futureValue: "",
  waitSeconds: "",
  lightningRiskPercent: "",
  residualValue: "0",
  waitCost: "0",
};

const harvestExample: HarvestShareValues = {
  currentValue: "100",
  futureValue: "200",
  waitSeconds: "30",
  lightningRiskPercent: "25",
  residualValue: "0",
  waitCost: "0",
};

const emptyProfitValues: ProfitShareValues = {
  attemptCost: "",
  harvestValue: "",
  failedAttempts: "0",
  elapsedMinutes: "",
};

const profitExample: ProfitShareValues = {
  attemptCost: "100",
  harvestValue: "600",
  failedAttempts: "2",
  elapsedMinutes: "10",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatSigned(value: number) {
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
}

function parseNonNegative(rawValue: string): number | null {
  if (!rawValue.trim()) return null;
  const value = Number(rawValue);
  return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER
    ? value
    : null;
}

function parsePositive(rawValue: string): number | null {
  const value = parseNonNegative(rawValue);
  return value !== null && value > 0 ? value : null;
}

function parseWholeNumber(rawValue: string): number | null {
  const value = parseNonNegative(rawValue);
  return value !== null && Number.isInteger(value) ? value : null;
}

function readSavedScenarios(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SavedScenario =>
          typeof item?.id === "string" &&
          typeof item?.label === "string" &&
          (item?.tool === "harvest" || item?.tool === "profit") &&
          typeof item?.primary === "string" &&
          typeof item?.secondary === "string",
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}

export function CalculatorExperience({
  intro,
  supportingContext,
}: {
  intro: ReactNode;
  supportingContext: ReactNode;
}) {
  const [tool, setTool] = useState<CalculatorTool>("harvest");
  const [harvestValues, setHarvestValues] =
    useState<HarvestShareValues>(emptyHarvestValues);
  const [profitValues, setProfitValues] =
    useState<ProfitShareValues>(emptyProfitValues);
  const [exampleLoaded, setExampleLoaded] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [copyFallback, setCopyFallback] = useState<string | null>(null);
  const trackedTools = useRef(new Set<CalculatorTool>());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const shared = parseCalculatorShareState(
        new URLSearchParams(window.location.search),
      );
      if (shared?.tool === "harvest") {
        setTool("harvest");
        setHarvestValues(shared.values);
      } else if (shared?.tool === "profit") {
        setTool("profit");
        setProfitValues(shared.values);
      }

      setSavedScenarios(readSavedScenarios());
      setStorageReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(savedScenarios.slice(0, 5)),
    );
  }, [savedScenarios, storageReady]);

  const harvestAnalysis = useMemo(() => {
    const currentValue = parseNonNegative(harvestValues.currentValue);
    const futureValue = parseNonNegative(harvestValues.futureValue);
    const waitSeconds = parsePositive(harvestValues.waitSeconds);
    const residualValue = parseNonNegative(harvestValues.residualValue);
    const waitCost = parseNonNegative(harvestValues.waitCost);

    if (
      currentValue === null ||
      futureValue === null ||
      waitSeconds === null ||
      residualValue === null ||
      waitCost === null ||
      residualValue > futureValue
    ) {
      return {
        threshold: null,
        decision: null,
        waitSeconds,
      } satisfies {
        threshold: HarvestThresholdResult | null;
        decision: CalculatorResult | null;
        waitSeconds: number | null;
      };
    }

    const threshold = calculateHarvestThreshold({
      currentValue,
      futureValue,
      residualValue,
      waitCost,
    });
    const riskPercent = harvestValues.lightningRiskPercent.trim()
      ? parseNonNegative(harvestValues.lightningRiskPercent)
      : null;
    const decision =
      riskPercent !== null && riskPercent <= 100
        ? calculateHarvestDecision({
            currentValue,
            futureValue,
            waitSeconds,
            lightningProbability: riskPercent / 100,
            residualValue,
            waitCost,
          })
        : null;

    return { threshold, decision, waitSeconds };
  }, [harvestValues]);

  const profitResult = useMemo<ObservedRunResult | null>(() => {
    const attemptCost = parseNonNegative(profitValues.attemptCost);
    const harvestValue = parseNonNegative(profitValues.harvestValue);
    const failedAttempts = parseWholeNumber(profitValues.failedAttempts);
    const elapsedMinutes = parsePositive(profitValues.elapsedMinutes);

    if (
      attemptCost === null ||
      harvestValue === null ||
      failedAttempts === null ||
      elapsedMinutes === null
    ) {
      return null;
    }

    return calculateObservedRun({
      attemptCost,
      harvestValue,
      failedAttempts,
      elapsedMinutes,
    });
  }, [profitValues]);

  const activeResultValid =
    tool === "harvest"
      ? harvestAnalysis.threshold?.status === "valid"
      : profitResult?.status === "valid";

  useEffect(() => {
    if (!activeResultValid || trackedTools.current.has(tool)) return;
    const dedupeKey = `live-${tool}`;
    const started = track("calculator_started", { dedupeKey });
    const completed = track("calculator_completed", { dedupeKey });
    if (started || completed) trackedTools.current.add(tool);
  }, [activeResultValid, tool]);

  useEffect(() => {
    if (
      tool !== "harvest" ||
      harvestAnalysis.decision?.status !== "valid"
    ) {
      return;
    }

    track(
      harvestAnalysis.decision.recommendation === "WAIT"
        ? "recommendation_wait"
        : "recommendation_harvest",
      { dedupeKey: `live-harvest-${harvestAnalysis.decision.recommendation}` },
    );
  }, [harvestAnalysis.decision, tool]);

  const updateHarvestValue = (
    field: keyof HarvestShareValues,
    value: string,
  ) => {
    setHarvestValues((current) => ({ ...current, [field]: value }));
    setExampleLoaded(false);
    setActionStatus(null);
    setCopyFallback(null);
  };

  const updateProfitValue = (
    field: keyof ProfitShareValues,
    value: string,
  ) => {
    setProfitValues((current) => ({ ...current, [field]: value }));
    setExampleLoaded(false);
    setActionStatus(null);
    setCopyFallback(null);
  };

  const switchTool = (nextTool: CalculatorTool) => {
    setTool(nextTool);
    setExampleLoaded(false);
    setActionStatus(null);
    setCopyFallback(null);
    setScenarioName("");
  };

  const loadExample = () => {
    if (tool === "harvest") setHarvestValues(harvestExample);
    else setProfitValues(profitExample);
    setExampleLoaded(true);
    setActionStatus("Example values loaded. Edit any field to make this your run.");
    setCopyFallback(null);
  };

  const reset = () => {
    if (tool === "harvest") setHarvestValues(emptyHarvestValues);
    else setProfitValues(emptyProfitValues);
    setExampleLoaded(false);
    setScenarioName("");
    setActionStatus("Inputs reset.");
    setCopyFallback(null);
    window.history.replaceState(null, "", `${window.location.pathname}#calculator`);
  };

  const resultSummary = useMemo(() => {
    if (tool === "harvest") {
      const threshold = harvestAnalysis.threshold;
      if (threshold?.status !== "valid") return null;
      const boundary =
        threshold.breakEvenProbability === null
          ? "unavailable"
          : `${formatNumber(threshold.breakEvenProbability * 100)}%`;
      const directCall =
        harvestAnalysis.decision?.status === "valid"
          ? harvestAnalysis.decision.recommendation.replace("_", " ")
          : "Add a risk estimate for a direct call";
      return `Greedy Growers harvest timing: ${directCall}. Maximum tolerable lightning risk: ${boundary}. Wait interval: ${harvestAnalysis.waitSeconds ?? "--"} seconds. Player inputs only; no official strike probability.`;
    }

    if (profitResult?.status !== "valid") return null;
    return `Greedy Growers observed run: ${profitResult.outcome.replace("_", " ")}. Net after failures: ${formatSigned(profitResult.netAfterFailures)}. Net per minute: ${formatSigned(profitResult.netPerMinute)}. Break-even harvest: ${formatNumber(profitResult.breakEvenHarvest)}. Player-entered run, not a forecast.`;
  }, [harvestAnalysis, profitResult, tool]);

  const copyText = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setActionStatus(successMessage);
      setCopyFallback(null);
    } catch {
      setActionStatus("Clipboard unavailable. Copy the text shown below.");
      setCopyFallback(text);
    }
  };

  const copyResult = async () => {
    if (!resultSummary) return;
    await copyText(resultSummary, "Result copied.");
  };

  const copyShareLink = async () => {
    if (!activeResultValid) return;
    const query = serializeCalculatorShareState(
      tool === "harvest"
        ? { tool, values: harvestValues }
        : { tool, values: profitValues },
    );
    const url = `${window.location.origin}${window.location.pathname}?${query}#calculator`;
    await copyText(url, "Share link copied.");
  };

  const saveScenario = () => {
    const label = scenarioName.trim();
    if (!label || !resultSummary) return;

    let primary = "";
    let secondary = "";
    if (tool === "harvest" && harvestAnalysis.threshold?.status === "valid") {
      primary =
        harvestAnalysis.threshold.breakEvenProbability === null
          ? "Risk boundary unavailable"
          : `${formatNumber(harvestAnalysis.threshold.breakEvenProbability * 100)}% max risk`;
      secondary =
        harvestAnalysis.decision?.status === "valid"
          ? harvestAnalysis.decision.recommendation.replace("_", " ")
          : `${harvestAnalysis.waitSeconds ?? "--"} sec interval`;
    } else if (tool === "profit" && profitResult?.status === "valid") {
      primary = `${formatSigned(profitResult.netPerMinute)} / min`;
      secondary = `${formatSigned(profitResult.netAfterFailures)} net`;
    }

    const saved: SavedScenario = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      tool,
      primary,
      secondary,
    };
    setSavedScenarios((current) => [saved, ...current].slice(0, 5));
    setScenarioName("");
    setActionStatus("Scenario saved in this browser tab.");
  };

  return (
    <>
      <Analytics />
      {intro}
      <CalculatorStatusStrip />

      <Card id="calculator" className="mt-6 scroll-mt-24 overflow-hidden">
        <CardHeader className="border-b border-survey-line">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lightning">
            Two player-input tools
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground">
            Run the Greedy Growers Calculator
          </h2>
          <CardDescription>
            Find a harvest-risk boundary or calculate one completed run after
            recorded failures. Every valid input updates its result immediately.
          </CardDescription>

          <div
            role="tablist"
            aria-label="Calculator modes"
            className="mt-4 grid gap-2 sm:grid-cols-2"
          >
            <Button
              id="harvest-tool-tab"
              type="button"
              role="tab"
              aria-selected={tool === "harvest"}
              aria-controls="harvest-tool-panel"
              variant={tool === "harvest" ? "default" : "outline"}
              onClick={() => switchTool("harvest")}
            >
              Harvest timing
            </Button>
            <Button
              id="profit-tool-tab"
              type="button"
              role="tab"
              aria-selected={tool === "profit"}
              aria-controls="profit-tool-panel"
              variant={tool === "profit" ? "growth" : "outline"}
              onClick={() => switchTool("profit")}
            >
              Run profit
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:items-start">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            {tool === "harvest" ? (
              <HarvestForm values={harvestValues} onChange={updateHarvestValue} />
            ) : (
              <ProfitForm values={profitValues} onChange={updateProfitValue} />
            )}
          </div>

          <div className="min-w-0 lg:sticky lg:top-[92px] lg:col-start-2 lg:row-start-1">
            {tool === "harvest" ? (
              <RecommendationCard
                result={harvestAnalysis.decision}
                thresholdResult={harvestAnalysis.threshold}
                waitSeconds={harvestAnalysis.waitSeconds}
              />
            ) : (
              <ProfitResultCard result={profitResult} />
            )}
          </div>

          <div className="min-w-0 lg:col-start-1">
            <ScenarioActions
              activeResultValid={activeResultValid}
              exampleLoaded={exampleLoaded}
              scenarioName={scenarioName}
              actionStatus={actionStatus}
              copyFallback={copyFallback}
              onScenarioNameChange={setScenarioName}
              onLoadExample={loadExample}
              onReset={reset}
              onCopyResult={copyResult}
              onCopyShareLink={copyShareLink}
              onSaveScenario={saveScenario}
            />
            <SavedScenarioList
              scenarios={savedScenarios}
              onClear={() => {
                setSavedScenarios([]);
                setActionStatus("Saved scenarios cleared.");
              }}
            />
            {supportingContext}
          </div>
        </CardContent>
      </Card>

      <AnalyticsConsent />
    </>
  );
}

function HarvestForm({
  values,
  onChange,
}: {
  values: HarvestShareValues;
  onChange: (field: keyof HarvestShareValues, value: string) => void;
}) {
  const currentError =
    values.currentValue.trim() && parseNonNegative(values.currentValue) === null
      ? "Enter a non-negative current value."
      : undefined;
  const futureError =
    values.futureValue.trim() && parseNonNegative(values.futureValue) === null
      ? "Enter a non-negative future value."
      : undefined;
  const waitError =
    values.waitSeconds.trim() && parsePositive(values.waitSeconds) === null
      ? "Enter a wait interval greater than zero."
      : undefined;
  const residual = parseNonNegative(values.residualValue);
  const future = parseNonNegative(values.futureValue);
  const residualError =
    residual !== null && future !== null && residual > future
      ? "Residual value cannot exceed future value."
      : undefined;
  const risk = values.lightningRiskPercent.trim()
    ? parseNonNegative(values.lightningRiskPercent)
    : null;
  const riskError =
    values.lightningRiskPercent.trim() && (risk === null || risk > 100)
      ? "Enter a lightning risk from 0 to 100."
      : undefined;

  return (
    <div
      id="harvest-tool-panel"
      role="tabpanel"
      aria-labelledby="harvest-tool-tab"
    >
      <form
        aria-label="Harvest timing inputs"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
      <div className="border border-survey-line bg-background px-4 py-4 sm:px-5">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-grow">
          Tool 01 · Decision boundary
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
          Harvest now or define one wait
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The wait interval labels your scenario; it never creates a lightning
          probability. Add risk only if you want a direct WAIT or HARVEST call.
        </p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <NumberField
          id="currentValue"
          label="Current harvest value"
          value={values.currentValue}
          description="What you can collect now."
          required
          error={currentError}
          onChange={(value) => onChange("currentValue", value)}
        />
        <NumberField
          id="futureValue"
          label="Value after waiting"
          value={values.futureValue}
          description="Your target for this exact wait interval."
          required
          error={futureError}
          onChange={(value) => onChange("futureValue", value)}
        />
        <NumberField
          id="waitSeconds"
          label="Wait interval in seconds"
          value={values.waitSeconds}
          description="Context only; seconds do not generate hidden odds."
          required
          min="0.01"
          error={waitError}
          onChange={(value) => onChange("waitSeconds", value)}
        />
        <NumberField
          id="lightningRiskPercent"
          label="Optional lightning risk"
          value={values.lightningRiskPercent}
          description="Your estimate for this interval, from 0 to 100%."
          error={riskError}
          max="100"
          onChange={(value) => onChange("lightningRiskPercent", value)}
        />
      </div>

      <Accordion type="single" collapsible className="mt-5">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced assumptions</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                id="residualValue"
                label="Residual value after lightning"
                value={values.residualValue}
                description="Keep 0 when your scenario assumes a full loss."
                error={residualError}
                onChange={(value) => onChange("residualValue", value)}
              />
              <NumberField
                id="waitCost"
                label="Cost of waiting"
                value={values.waitCost}
                description="Optional opportunity cost in the same value unit."
                onChange={(value) => onChange("waitCost", value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </form>
    </div>
  );
}

function ProfitForm({
  values,
  onChange,
}: {
  values: ProfitShareValues;
  onChange: (field: keyof ProfitShareValues, value: string) => void;
}) {
  const attemptCostError =
    values.attemptCost.trim() && parseNonNegative(values.attemptCost) === null
      ? "Enter a non-negative attempt cost."
      : undefined;
  const harvestValueError =
    values.harvestValue.trim() &&
    parseNonNegative(values.harvestValue) === null
      ? "Enter a non-negative harvest value."
      : undefined;
  const elapsedMinutesError =
    values.elapsedMinutes.trim() &&
    parsePositive(values.elapsedMinutes) === null
      ? "Enter elapsed minutes greater than zero."
      : undefined;
  const failures = values.failedAttempts.trim()
    ? parseWholeNumber(values.failedAttempts)
    : null;
  const failuresError =
    values.failedAttempts.trim() && failures === null
      ? "Enter a whole number of failed attempts."
      : undefined;

  return (
    <div
      id="profit-tool-panel"
      role="tabpanel"
      aria-labelledby="profit-tool-tab"
    >
      <form
        aria-label="Observed run inputs"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
      <div className="border border-survey-line bg-background px-4 py-4 sm:px-5">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-grow">
          Tool 02 · Completed run
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
          Profit after real failed attempts
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Record one finished run. Lightning appears only as failures you
          actually counted, never as a predicted probability.
        </p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <NumberField
          id="attemptCost"
          label="Attempt cost"
          value={values.attemptCost}
          description="Seed, fertilizer, or other cost paid per attempt."
          required
          error={attemptCostError}
          onChange={(value) => onChange("attemptCost", value)}
        />
        <NumberField
          id="harvestValue"
          label="Successful harvest value"
          value={values.harvestValue}
          description="The value from the successful run you observed."
          required
          error={harvestValueError}
          onChange={(value) => onChange("harvestValue", value)}
        />
        <NumberField
          id="failedAttempts"
          label="Failed attempts before success"
          value={values.failedAttempts}
          description="Whole attempts already lost before this harvest."
          required
          step="1"
          error={failuresError}
          onChange={(value) => onChange("failedAttempts", value)}
        />
        <NumberField
          id="elapsedMinutes"
          label="Total elapsed minutes"
          value={values.elapsedMinutes}
          description="Include the successful run and recorded failures."
          required
          min="0.01"
          error={elapsedMinutesError}
          onChange={(value) => onChange("elapsedMinutes", value)}
        />
      </div>
      </form>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  description,
  error,
  required = false,
  min = "0",
  max,
  step = "0.01",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  description: string;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
  onChange: (value: string) => void;
}) {
  const noteId = `${id}-note`;
  const errorId = `${id}-error`;

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-lightning">
          {required ? "Your input" : "Optional"}
        </span>
      </div>
      <p id={noteId} className="mt-1 min-h-12 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${noteId} ${errorId}` : noteId}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm font-semibold text-risk">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ScenarioActions({
  activeResultValid,
  exampleLoaded,
  scenarioName,
  actionStatus,
  copyFallback,
  onScenarioNameChange,
  onLoadExample,
  onReset,
  onCopyResult,
  onCopyShareLink,
  onSaveScenario,
}: {
  activeResultValid: boolean;
  exampleLoaded: boolean;
  scenarioName: string;
  actionStatus: string | null;
  copyFallback: string | null;
  onScenarioNameChange: (value: string) => void;
  onLoadExample: () => void;
  onReset: () => void;
  onCopyResult: () => void;
  onCopyShareLink: () => void;
  onSaveScenario: () => void;
}) {
  return (
    <section className="mt-6 border border-survey-line bg-background px-4 py-5 sm:px-5">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onLoadExample}>
          <Sparkles aria-hidden="true" className="size-4" />
          Load example
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Reset
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!activeResultValid} onClick={onCopyResult}>
          <Clipboard aria-hidden="true" className="size-4" />
          Copy result
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!activeResultValid} onClick={onCopyShareLink}>
          <Link2 aria-hidden="true" className="size-4" />
          Copy share link
        </Button>
      </div>

      {exampleLoaded ? (
        <p className="mt-3 border-l-2 border-lightning pl-3 text-sm leading-6 text-foreground">
          Example mode is active. These are illustrative values, not official game data.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 border-t border-dashed border-survey-line pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <Label htmlFor="scenarioName">Scenario name</Label>
          <p id="scenarioName-note" className="mt-1 text-sm text-muted-foreground">
            Save up to five results in this browser tab for quick comparison.
          </p>
          <Input
            id="scenarioName"
            value={scenarioName}
            maxLength={60}
            aria-describedby="scenarioName-note"
            placeholder="Example: two lightning losses"
            onChange={(event) => onScenarioNameChange(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="growth"
          disabled={!activeResultValid || !scenarioName.trim()}
          onClick={onSaveScenario}
        >
          <Save aria-hidden="true" className="size-4" />
          Save scenario
        </Button>
      </div>

      <p aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold text-lightning">
        {actionStatus}
      </p>
      {copyFallback ? (
        <textarea
          aria-label="Copy fallback"
          readOnly
          value={copyFallback}
          className="mt-2 min-h-24 w-full resize-y border border-survey-line bg-surface px-3 py-2 text-sm text-foreground"
        />
      ) : null}
    </section>
  );
}

function SavedScenarioList({
  scenarios,
  onClear,
}: {
  scenarios: SavedScenario[];
  onClear: () => void;
}) {
  return (
    <section
      aria-label="Saved scenarios"
      className="mt-6 border border-survey-line bg-background px-4 py-5 sm:px-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-grow">
            Session comparison
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
            Saved scenarios
          </h3>
        </div>
        <Button type="button" size="sm" variant="ghost" disabled={scenarios.length === 0} onClick={onClear}>
          Clear all
        </Button>
      </div>

      {scenarios.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Save a result to compare it here. Scenarios remain in this tab only
          and never become site data or calculator presets.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {scenarios.map((scenario) => (
            <article key={scenario.id} className="border border-survey-line bg-surface px-4 py-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-lightning">
                {scenario.tool === "harvest" ? "Harvest timing" : "Run profit"}
              </p>
              <h4 className="mt-2 font-display text-lg font-semibold text-foreground">
                {scenario.label}
              </h4>
              <p className="mt-3 font-mono text-base font-semibold text-grow">
                {scenario.primary}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{scenario.secondary}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
