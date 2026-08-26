export type AnalyticsEvent =
  | "calculator_started"
  | "calculator_completed"
  | "recommendation_harvest"
  | "recommendation_wait"
  | "seed_selected"
  | "seed_detail_viewed"
  | "submit_data_started"
  | "submit_data_completed"
  | "play_roblox_clicked";

export type AnalyticsConsentChoice = "granted" | "denied" | "unset";

const CONSENT_KEY = "greedy-growers-analytics-consent";
const CLARITY_PROJECT_ID = "y8aj6ax98g";
export const ANALYTICS_CONSENT_EVENT = "greedy-growers:analytics-consent";

const emittedActions = new Set<string>();
let consentDefaultInitialized = false;
let analyticsConfigured = false;
let clarityConfigured = false;

type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFunction;
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function analyticsId(): string | null {
  const value = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return value || null;
}

function createQueueBackedGtag(): (...args: unknown[]) => void {
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => window.dataLayer?.push(args);
  return window.gtag;
}

function gtagForConsent(): ((...args: unknown[]) => void) | null {
  if (typeof window === "undefined") return null;
  return window.gtag ?? (analyticsId() ? createQueueBackedGtag() : null);
}

function gtagForEvents(): ((...args: unknown[]) => void) | null {
  if (typeof window === "undefined") return null;
  return window.gtag ?? (analyticsId() ? createQueueBackedGtag() : null);
}

function enableClarity(): void {
  if (clarityConfigured) return;

  clarityConfigured = true;
  window.clarity ??= ((...args: unknown[]) => {
    window.clarity!.q ??= [];
    window.clarity!.q.push(args);
  }) as ClarityFunction;

  if (!document.querySelector(`script[data-greedy-clarity="${CLARITY_PROJECT_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
    script.dataset.greedyClarity = CLARITY_PROJECT_ID;
    document.head.append(script);
  }
}

export function readAnalyticsConsent(): AnalyticsConsentChoice {
  if (typeof window === "undefined") return "unset";
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "granted" || stored === "denied" ? stored : "unset";
}

export function initializeDeniedAnalyticsConsent(): void {
  const gtag = gtagForConsent();
  if (!gtag || consentDefaultInitialized) return;

  consentDefaultInitialized = true;
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
}

export function enableAnalytics(): void {
  if (typeof window === "undefined" || readAnalyticsConsent() !== "granted") return;

  enableClarity();

  const id = analyticsId();
  if (!id) return;

  const gtag = createQueueBackedGtag();
  if (analyticsConfigured) return;

  analyticsConfigured = true;
  if (!document.querySelector(`script[data-greedy-ga="${id}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.dataset.greedyGa = id;
    document.head.append(script);
  }

  gtag("js", new Date());
  gtag("config", id, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;

  const choice: Exclude<AnalyticsConsentChoice, "unset"> = granted
    ? "granted"
    : "denied";
  window.localStorage.setItem(CONSENT_KEY, choice);

  const gtag = gtagForConsent();
  gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (granted) enableAnalytics();

  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: choice }));
}

export function track(
  event: AnalyticsEvent,
  options: { dedupeKey?: string } = {},
): boolean {
  if (typeof window === "undefined" || readAnalyticsConsent() !== "granted") {
    return false;
  }

  const gtag = gtagForEvents();
  if (!gtag) return false;

  const actionKey = options.dedupeKey ? `${event}:${options.dedupeKey}` : null;
  if (actionKey && emittedActions.has(actionKey)) return false;

  gtag("event", event);
  if (actionKey) emittedActions.add(actionKey);
  return true;
}
