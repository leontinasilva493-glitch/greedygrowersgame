"use client";

import {
  useState,
  useRef,
  useMemo,
  type FormEvent,
  type ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";

import { Analytics } from "../analytics/Analytics";
import { AnalyticsConsent } from "../analytics/AnalyticsConsent";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { track } from "../../features/analytics/events";
import { calculateHarvestDecision } from "../../features/calculator/engine";
import type { CalculatorResult } from "../../features/calculator/types";
import { RecommendationCard } from "./RecommendationCard";

type FieldName =
  | "currentValue"
  | "futureValue"
  | "waitSeconds"
  | "lightningRiskPercent"
  | "residualValue"
  | "waitCost";

type FormState = Record<FieldName, string>;
type ErrorState = Partial<Record<FieldName, string>>;

const fieldOrder: FieldName[] = [
  "currentValue",
  "futureValue",
  "waitSeconds",
  "lightningRiskPercent",
  "residualValue",
  "waitCost",
];

const defaultValues: FormState = {
  currentValue: "100",
  futureValue: "600",
  waitSeconds: "6",
  lightningRiskPercent: "24.34",
  residualValue: "0",
  waitCost: "0",
};

const noteText = "Your estimate";

function parseInput(rawValue: string): number {
  const trimmed = rawValue.trim();
  if (!trimmed) return Number.NaN;
  return Number(trimmed);
}

const defaultResult = calculateHarvestDecision({
  currentValue: parseInput(defaultValues.currentValue),
  futureValue: parseInput(defaultValues.futureValue),
  waitSeconds: parseInput(defaultValues.waitSeconds),
  lightningProbability:
    parseInput(defaultValues.lightningRiskPercent) / 100,
  residualValue: parseInput(defaultValues.residualValue),
  waitCost: parseInput(defaultValues.waitCost),
});

export function CalculatorExperience({
  intro,
  supportingContext,
}: {
  intro: ReactNode;
  supportingContext: ReactNode;
}) {
  const [values, setValues] = useState<FormState>(defaultValues);
  const [errors, setErrors] = useState<ErrorState>({});
  const [result, setResult] = useState<CalculatorResult | null>(defaultResult);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const inputRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({});

  const waitSecondsValue = useMemo(() => {
    const parsed = parseInput(values.waitSeconds);
    return Number.isFinite(parsed) ? parsed : null;
  }, [values.waitSeconds]);

  const updateValue = (field: FieldName, nextValue: string) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => {
      if (!current[field]) return current;

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const parsed = {
      currentValue: parseInput(values.currentValue),
      futureValue: parseInput(values.futureValue),
      waitSeconds: parseInput(values.waitSeconds),
      lightningProbability: parseInput(values.lightningRiskPercent) / 100,
      residualValue: parseInput(values.residualValue),
      waitCost: parseInput(values.waitCost),
    };

    const nextErrors = validateFields(parsed);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
      if (firstInvalid) inputRefs.current[firstInvalid]?.focus();

      setResult({
        status: "invalid",
        recommendation: "NOT_ENOUGH_INPUT",
        errors: fieldOrder
          .map((field) => nextErrors[field])
          .filter((message): message is string => Boolean(message)),
      });
      return;
    }

    const nextAttempt = attemptNumber + 1;
    setAttemptNumber(nextAttempt);
    const dedupeKey = `attempt-${nextAttempt}`;

    track("calculator_started", { dedupeKey });

    const nextResult = calculateHarvestDecision(parsed);
    setErrors({});
    setResult(nextResult);

    track("calculator_completed", { dedupeKey });
    if (nextResult.status === "valid") {
      track(
        nextResult.recommendation === "WAIT"
          ? "recommendation_wait"
          : "recommendation_harvest",
        { dedupeKey },
      );
    }
  };

  return (
    <>
      <Analytics />
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:items-start">
        <div className="min-w-0">
          {intro}

          <Card className="mt-6 overflow-hidden">
              <CardHeader>
                <h2 className="font-display text-xl font-semibold leading-tight tracking-[-0.015em] text-foreground">
                  Run the Greedy Growers Calculator
                </h2>
                <CardDescription>
                  Enter your current harvest value, expected value after
                  waiting, wait time, and lightning-risk estimate. The result
                  favors harvesting when both choices have equal expected value.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={submit} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <NumberField
                      field="currentValue"
                      label="Current harvest value"
                      note={noteText}
                      description="Enter the value you would receive if you harvested now."
                      value={values.currentValue}
                      error={errors.currentValue}
                      onChange={updateValue}
                      inputRef={(node) => {
                        inputRefs.current.currentValue = node;
                      }}
                    />
                    <NumberField
                      field="futureValue"
                      label="Value after waiting"
                      note={noteText}
                      description="Enter the value you expect the same tree to reach after this wait."
                      value={values.futureValue}
                      error={errors.futureValue}
                      onChange={updateValue}
                      inputRef={(node) => {
                        inputRefs.current.futureValue = node;
                      }}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <NumberField
                      field="waitSeconds"
                      label="Wait time in seconds"
                      note={noteText}
                      description="Enter the exact number of seconds you plan to wait before checking again."
                      value={values.waitSeconds}
                      error={errors.waitSeconds}
                      onChange={updateValue}
                      inputRef={(node) => {
                        inputRefs.current.waitSeconds = node;
                      }}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="lightningRiskPercent">
                          Lightning risk for this wait
                        </Label>
                        <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-lightning">
                          {noteText}
                        </span>
                      </div>
                      <p
                        id="lightningRiskPercent-note"
                        className="mt-1 text-sm leading-6 text-muted-foreground"
                      >
                        Enter a percentage from 0 to 100 for this interval only.
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
                        <RiskSlider
                          value={values.lightningRiskPercent}
                          onChange={(nextValue) =>
                            updateValue("lightningRiskPercent", nextValue)
                          }
                        />
                        <Input
                          ref={(node) => {
                            inputRefs.current.lightningRiskPercent = node;
                          }}
                          id="lightningRiskPercent"
                          name="lightningRiskPercent"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="100"
                          step="0.01"
                          value={values.lightningRiskPercent}
                          aria-invalid={errors.lightningRiskPercent ? "true" : "false"}
                          aria-describedby={
                            errors.lightningRiskPercent
                              ? "lightningRiskPercent-note lightningRiskPercent-error"
                              : "lightningRiskPercent-note"
                          }
                          onChange={(event) =>
                            updateValue("lightningRiskPercent", event.target.value)
                          }
                        />
                      </div>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <p className="text-sm leading-6 text-muted-foreground">
                          Example: enter 25 if you think the chance of losing the
                          wait is one in four.
                        </p>
                        <p className="font-mono text-sm text-lightning">
                          {values.lightningRiskPercent.trim() || "0"}%
                        </p>
                      </div>
                      {errors.lightningRiskPercent ? (
                        <p
                          id="lightningRiskPercent-error"
                          className="mt-2 text-sm font-semibold text-risk"
                        >
                          {errors.lightningRiskPercent}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="advanced">
                      <AccordionTrigger>Advanced assumptions</AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="grid gap-5 sm:grid-cols-2">
                          <NumberField
                            field="residualValue"
                            label="Residual value after lightning"
                            note={noteText}
                            value={values.residualValue}
                            error={errors.residualValue}
                            onChange={updateValue}
                            inputRef={(node) => {
                              inputRefs.current.residualValue = node;
                            }}
                            description="Use 0 if you believe the tree value fully disappears after a strike."
                          />
                          <NumberField
                            field="waitCost"
                            label="Cost of waiting"
                            note={noteText}
                            value={values.waitCost}
                            error={errors.waitCost}
                            onChange={updateValue}
                            inputRef={(node) => {
                              inputRefs.current.waitCost = node;
                            }}
                            description="Optional opportunity cost, fertilizer spend, or another wait penalty."
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex flex-col gap-3 border-t border-dashed border-survey-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                      Press Enter in any field or run the button below. The result
                      panel updates in place and announces changes for screen
                      readers.
                    </p>
                    <Button type="submit" className="w-full sm:w-auto">
                      Calculate
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
          </Card>

          {supportingContext}
          <AnalyticsConsent />
        </div>

        <div className="min-w-0 lg:sticky lg:top-[92px]">
          <RecommendationCard result={result} waitSeconds={waitSecondsValue} />
        </div>
      </section>
    </>
  );
}

function NumberField({
  field,
  label,
  note,
  value,
  error,
  description,
  inputRef,
  onChange,
}: {
  field: Exclude<FieldName, "lightningRiskPercent">;
  label: string;
  note: string;
  value: string;
  error?: string;
  description: string;
  inputRef: (node: HTMLInputElement | null) => void;
  onChange: (field: FieldName, nextValue: string) => void;
}) {
  const noteId = `${field}-note`;
  const errorId = `${field}-error`;

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={field}>{label}</Label>
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-lightning">
          {note}
        </span>
      </div>
      <p id={noteId} className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Input
        ref={inputRef}
        id={field}
        name={field}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={value}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${noteId} ${errorId}` : noteId}
        onChange={(event) => onChange(field, event.target.value)}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm font-semibold text-risk">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RiskSlider({
  value,
  onChange,
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const safeValue = (() => {
    const parsed = parseInput(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(100, Math.max(0, parsed));
  })();

  return (
    <div className="flex min-h-11 items-center">
      <input
        aria-label="Lightning risk slider"
        type="range"
        min="0"
        max="100"
        step="0.01"
        value={safeValue}
        onChange={(event) => onChange(event.target.value)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-survey-line accent-[var(--lightning)]"
      />
    </div>
  );
}

function validateFields(input: {
  currentValue: number;
  futureValue: number;
  waitSeconds: number;
  lightningProbability: number;
  residualValue: number;
  waitCost: number;
}): ErrorState {
  const errors: ErrorState = {};

  if (!Number.isFinite(input.currentValue) || input.currentValue < 0) {
    errors.currentValue = "Enter a non-negative current value.";
  }

  if (!Number.isFinite(input.futureValue) || input.futureValue < 0) {
    errors.futureValue = "Enter a non-negative future value.";
  }

  if (!Number.isFinite(input.waitSeconds) || input.waitSeconds < 0) {
    errors.waitSeconds = "Enter a non-negative wait time.";
  }

  if (
    !Number.isFinite(input.lightningProbability) ||
    input.lightningProbability < 0 ||
    input.lightningProbability > 1
  ) {
    errors.lightningRiskPercent = "Enter a lightning risk from 0 to 100.";
  }

  if (!Number.isFinite(input.residualValue) || input.residualValue < 0) {
    errors.residualValue = "Enter a non-negative residual value.";
  }

  if (!Number.isFinite(input.waitCost) || input.waitCost < 0) {
    errors.waitCost = "Enter a non-negative waiting cost.";
  }

  if (
    errors.residualValue === undefined &&
    Number.isFinite(input.futureValue) &&
    input.residualValue > input.futureValue
  ) {
    errors.residualValue = "Residual value cannot exceed future value.";
  }

  return errors;
}
