"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SubmitDataFormProps {
  enabled: boolean;
  disabledReason: string | null;
  previewMode: boolean;
  retentionDays: string | null;
}

interface FormState {
  submissionType: "observation" | "growth_measurement";
  seedId: string;
  treeInstanceId: string;
  serverSessionId: string;
  observationProtocol: "precommitted_window" | "opportunistic";
  treeAgeAtStartSeconds: string;
  treeAgeAtEndSeconds: string;
  plannedStopSeconds: string;
  event: "lightning" | "censored";
  censorReason: "planned_stop" | "session_ended" | "lost_to_followup" | "harvested";
  eventTimePrecision: "exact_second" | "estimated_second" | "unknown";
  currentValue: string;
  endValue: string;
  currency: string;
  exposureSeconds: string;
  observedAt: string;
  gameVersion: string;
  evidenceUrl: string;
  notes: string;
  evidenceConsent: boolean;
  website: string;
}

const defaultState: FormState = {
  submissionType: "observation",
  seedId: "",
  treeInstanceId: "",
  serverSessionId: "",
  observationProtocol: "precommitted_window",
  treeAgeAtStartSeconds: "0",
  treeAgeAtEndSeconds: "30",
  plannedStopSeconds: "30",
  event: "censored",
  censorReason: "planned_stop",
  eventTimePrecision: "exact_second",
  currentValue: "",
  endValue: "",
  currency: "",
  exposureSeconds: "30",
  observedAt: "2026-07-26T12:00",
  gameVersion: "unverified",
  evidenceUrl: "",
  notes: "",
  evidenceConsent: false,
  website: "",
};

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : Number(trimmed);
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function SubmitDataForm({
  enabled,
  disabledReason,
  previewMode,
  retentionDays,
}: SubmitDataFormProps) {
  const [form, setForm] = useState<FormState>(defaultState);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const helperText = useMemo(() => {
    if (enabled && previewMode) {
      return "Local preview override is active. Production still requires webhook delivery and retention settings.";
    }
    if (enabled && retentionDays) {
      return `Pending submissions are retained for ${retentionDays} days before expiry review.`;
    }
    return disabledReason;
  }, [disabledReason, enabled, previewMode, retentionDays]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled) {
      return;
    }

    setError(null);
    setReceipt(null);

    const observedAtIso = new Date(form.observedAt).toISOString();
    const payload = {
      submissionType: form.submissionType,
      seedId: toOptionalString(form.seedId),
      treeInstanceId: form.treeInstanceId.trim(),
      serverSessionId: form.serverSessionId.trim(),
      observationProtocol: form.observationProtocol,
      treeAgeAtStartSeconds: Number(form.treeAgeAtStartSeconds),
      treeAgeAtEndSeconds: Number(form.treeAgeAtEndSeconds),
      plannedStopSeconds: toOptionalNumber(form.plannedStopSeconds),
      event: form.event,
      censorReason:
        form.event === "censored" ? form.censorReason : undefined,
      eventTimePrecision: form.eventTimePrecision,
      currentValue: toOptionalNumber(form.currentValue),
      endValue: toOptionalNumber(form.endValue),
      currency: toOptionalString(form.currency),
      exposureSeconds: Number(form.exposureSeconds),
      observedAt: observedAtIso,
      gameVersion: form.gameVersion.trim(),
      evidenceUrl: form.evidenceUrl.trim(),
      evidenceConsent: form.evidenceConsent,
      notes: toOptionalString(form.notes),
      website: form.website,
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const fallback = `Submission failed with status ${response.status}.`;
          try {
            const body = (await response.json()) as { error?: string };
            setError(body.error ?? fallback);
          } catch {
            setError(fallback);
          }
          return;
        }

        const body = (await response.json()) as { receipt: string };
        setReceipt(body.receipt);
      } catch {
        setError("Submission failed before the moderation inbox accepted the payload.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission form</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <input
            aria-hidden="true"
            autoComplete="off"
            className="hidden"
            name="website"
            tabIndex={-1}
            value={form.website}
            onChange={(event) => setField("website", event.target.value)}
          />

          <div className="rounded-[6px] border border-dashed border-survey-line bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
            {helperText}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="submissionType">Submission type</Label>
              <select
                id="submissionType"
                className="min-h-11 rounded-[6px] border border-input bg-background px-3 text-base text-foreground"
                disabled={!enabled || isPending}
                value={form.submissionType}
                onChange={(event) =>
                  setField(
                    "submissionType",
                    event.target.value as FormState["submissionType"],
                  )
                }
              >
                <option value="observation">Observation</option>
                <option value="growth_measurement">Growth measurement</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seedId">Seed ID</Label>
              <Input
                id="seedId"
                disabled={!enabled || isPending}
                value={form.seedId}
                onChange={(event) => setField("seedId", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treeInstanceId">Tree instance ID</Label>
              <Input
                id="treeInstanceId"
                required
                disabled={!enabled || isPending}
                value={form.treeInstanceId}
                onChange={(event) =>
                  setField("treeInstanceId", event.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="serverSessionId">Server session ID</Label>
              <Input
                id="serverSessionId"
                required
                disabled={!enabled || isPending}
                value={form.serverSessionId}
                onChange={(event) =>
                  setField("serverSessionId", event.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observationProtocol">Observation protocol</Label>
              <select
                id="observationProtocol"
                className="min-h-11 rounded-[6px] border border-input bg-background px-3 text-base text-foreground"
                disabled={!enabled || isPending}
                value={form.observationProtocol}
                onChange={(event) =>
                  setField(
                    "observationProtocol",
                    event.target.value as FormState["observationProtocol"],
                  )
                }
              >
                <option value="precommitted_window">Precommitted window</option>
                <option value="opportunistic">Opportunistic</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event">Outcome</Label>
              <select
                id="event"
                className="min-h-11 rounded-[6px] border border-input bg-background px-3 text-base text-foreground"
                disabled={!enabled || isPending}
                value={form.event}
                onChange={(event) =>
                  setField("event", event.target.value as FormState["event"])
                }
              >
                <option value="censored">Censored</option>
                <option value="lightning">Lightning</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treeAgeAtStartSeconds">Tree age at start (seconds)</Label>
              <Input
                id="treeAgeAtStartSeconds"
                inputMode="numeric"
                required
                disabled={!enabled || isPending}
                value={form.treeAgeAtStartSeconds}
                onChange={(event) =>
                  setField("treeAgeAtStartSeconds", event.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treeAgeAtEndSeconds">Tree age at end (seconds)</Label>
              <Input
                id="treeAgeAtEndSeconds"
                inputMode="numeric"
                required
                disabled={!enabled || isPending}
                value={form.treeAgeAtEndSeconds}
                onChange={(event) =>
                  setField("treeAgeAtEndSeconds", event.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plannedStopSeconds">Planned stop (seconds)</Label>
              <Input
                id="plannedStopSeconds"
                inputMode="numeric"
                disabled={!enabled || isPending}
                value={form.plannedStopSeconds}
                onChange={(event) =>
                  setField("plannedStopSeconds", event.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exposureSeconds">Exposure (seconds)</Label>
              <Input
                id="exposureSeconds"
                inputMode="numeric"
                required
                disabled={!enabled || isPending}
                value={form.exposureSeconds}
                onChange={(event) =>
                  setField("exposureSeconds", event.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="censorReason">Censor reason</Label>
              <select
                id="censorReason"
                className="min-h-11 rounded-[6px] border border-input bg-background px-3 text-base text-foreground"
                disabled={!enabled || isPending || form.event !== "censored"}
                value={form.censorReason}
                onChange={(event) =>
                  setField(
                    "censorReason",
                    event.target.value as FormState["censorReason"],
                  )
                }
              >
                <option value="planned_stop">Planned stop</option>
                <option value="session_ended">Session ended</option>
                <option value="lost_to_followup">Lost to follow-up</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eventTimePrecision">Event time precision</Label>
              <select
                id="eventTimePrecision"
                className="min-h-11 rounded-[6px] border border-input bg-background px-3 text-base text-foreground"
                disabled={!enabled || isPending}
                value={form.eventTimePrecision}
                onChange={(event) =>
                  setField(
                    "eventTimePrecision",
                    event.target.value as FormState["eventTimePrecision"],
                  )
                }
              >
                <option value="exact_second">Exact second</option>
                <option value="estimated_second">Estimated second</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observedAt">Observed at</Label>
              <Input
                id="observedAt"
                type="datetime-local"
                required
                disabled={!enabled || isPending}
                value={form.observedAt}
                onChange={(event) => setField("observedAt", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gameVersion">Current game version</Label>
              <Input
                id="gameVersion"
                required
                disabled={!enabled || isPending}
                value={form.gameVersion}
                onChange={(event) => setField("gameVersion", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="evidenceUrl">Evidence URL</Label>
              <Input
                id="evidenceUrl"
                type="url"
                required
                disabled={!enabled || isPending}
                value={form.evidenceUrl}
                onChange={(event) => setField("evidenceUrl", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currentValue">Current value</Label>
              <Input
                id="currentValue"
                inputMode="decimal"
                disabled={!enabled || isPending}
                value={form.currentValue}
                onChange={(event) => setField("currentValue", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endValue">End value</Label>
              <Input
                id="endValue"
                inputMode="decimal"
                disabled={!enabled || isPending}
                value={form.endValue}
                onChange={(event) => setField("endValue", event.target.value)}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="currency">Currency or unit</Label>
              <Input
                id="currency"
                disabled={!enabled || isPending}
                value={form.currency}
                onChange={(event) => setField("currency", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Reviewer notes</Label>
            <Textarea
              id="notes"
              disabled={!enabled || isPending}
              value={form.notes}
              onChange={(event) => setField("notes", event.target.value)}
            />
          </div>

          <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
            <input
              checked={form.evidenceConsent}
              disabled={!enabled || isPending}
              type="checkbox"
              onChange={(event) =>
                setField("evidenceConsent", event.target.checked)
              }
            />
            <span>
              <span className="font-semibold text-foreground">Evidence consent</span>
              <br />
              I confirm the evidence is mine to submit, excludes private contact
              details, and can enter manual moderation review.
            </span>
          </label>

          {error ? (
            <p className="text-sm text-risk" role="alert">
              {error}
            </p>
          ) : null}

          {receipt ? (
            <p className="text-sm text-grow" role="status">
              Receipt: {receipt}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={!enabled || isPending} type="submit">
              {isPending ? "Submitting..." : "Submit for review"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Manual review only. A submission never writes directly into the public dataset.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
