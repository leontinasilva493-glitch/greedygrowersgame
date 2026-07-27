"use client";

import { BarChart3, ShieldCheck } from "lucide-react";
import { useState } from "react";

import {
  readAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsentChoice,
} from "../../features/analytics/events";
import { Button } from "../ui/button";

function initialChoice(): AnalyticsConsentChoice {
  return typeof window === "undefined" ? "unset" : readAnalyticsConsent();
}

export function AnalyticsConsent() {
  const [choice, setChoice] = useState<AnalyticsConsentChoice>(initialChoice);

  const choose = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setChoice(granted ? "granted" : "denied");
  };

  return (
    <aside
      aria-labelledby="analytics-consent-title"
      className="mt-6 border border-survey-line bg-surface px-4 py-4 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-grow"
        />
        <div className="min-w-0 flex-1">
          <h2
            id="analytics-consent-title"
            className="font-display text-lg font-semibold text-foreground"
          >
            Optional analytics
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Analytics is off by default. If enabled, we send event names only -
            never calculator values, URLs, receipts, evidence, or identifiers.
          </p>
          {choice !== "unset" ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <BarChart3 aria-hidden="true" className="size-4 text-lightning" />
              Analytics {choice === "granted" ? "enabled" : "kept off"}.
            </p>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant={choice === "granted" ? "growth" : "default"}
              onClick={() => choose(true)}
            >
              Allow analytics
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => choose(false)}
            >
              Keep analytics off
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
