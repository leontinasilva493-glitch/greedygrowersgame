"use client";

import { useEffect } from "react";
import {
  ANALYTICS_CONSENT_EVENT,
  enableAnalytics,
  initializeDeniedAnalyticsConsent,
  readAnalyticsConsent,
} from "../../features/analytics/events";

export function Analytics() {
  useEffect(() => {
    initializeDeniedAnalyticsConsent();
    if (readAnalyticsConsent() === "granted") enableAnalytics();

    const handleConsent = () => {
      if (readAnalyticsConsent() === "granted") enableAnalytics();
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
  }, []);

  return null;
}
