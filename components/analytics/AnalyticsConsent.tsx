"use client";

import { BarChart3, ShieldCheck } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsentChoice,
} from "../../features/analytics/events";
import { Button } from "../ui/button";

export function AnalyticsConsent() {
  const choice = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);
      return () =>
        window.removeEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);
    },
    readAnalyticsConsent,
    (): AnalyticsConsentChoice => "unset",
  );

  const choose = (granted: boolean) => {
    setAnalyticsConsent(granted);
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
            Optional analytics are off by default. If enabled, Microsoft
            Clarity can record page interactions. This choice does not control
            advertising. Calculator values, evidence,
            and receipts remain excluded from custom analytics events.
          </p>
          {choice !== "unset" ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <BarChart3 aria-hidden="true" className="size-4 text-lightning" />
              Optional services {choice === "granted" ? "enabled" : "kept off"}.
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
