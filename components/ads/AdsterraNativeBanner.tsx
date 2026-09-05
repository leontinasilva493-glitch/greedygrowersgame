"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
} from "@/features/analytics/events";

const AD_CONTAINER_ID = "container-ad7a012e1693b7d27de84829a3838a5c";
const AD_SCRIPT_ID = "adsterra-native-banner-script";
const AD_SCRIPT_URL =
  "https://pl31052446.profitableratecpmnetwork.com/ad7a012e1693b7d27de84829a3838a5c/invoke.js";
const AD_FREE_ROUTES = new Set([
  "/contact",
  "/data-status",
  "/privacy",
  "/submit-data",
  "/terms",
]);

type LoadState = "loading" | "filled" | "empty";

export function AdsterraNativeBanner() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const consent = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);
      return () =>
        window.removeEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);
    },
    readAnalyticsConsent,
    () => "unset",
  );
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const isEligible = !AD_FREE_ROUTES.has(pathname);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || consent !== "granted" || !isEligible) return;

    container.replaceChildren();
    document.getElementById(AD_SCRIPT_ID)?.remove();
    const observer = new MutationObserver(() => {
      if (container.childElementCount > 0) setLoadState("filled");
    });
    observer.observe(container, { childList: true, subtree: true });

    const script = document.createElement("script");
    script.id = AD_SCRIPT_ID;
    script.async = true;
    script.src = AD_SCRIPT_URL;
    script.setAttribute("data-cfasync", "false");
    script.addEventListener("error", () => setLoadState("empty"), { once: true });
    container.before(script);

    const emptyTimer = window.setTimeout(() => {
      if (container.childElementCount === 0) setLoadState("empty");
    }, 8_000);

    return () => {
      window.clearTimeout(emptyTimer);
      observer.disconnect();
      script.remove();
      container.replaceChildren();
    };
  }, [consent, isEligible, pathname]);

  if (!isEligible || consent !== "granted") return null;

  return (
    <aside
      aria-label="Advertisement"
      data-ad-state={loadState}
      className={
        loadState === "empty"
          ? "hidden"
          : "my-8 min-w-0 overflow-hidden border-y border-dashed border-survey-line bg-surface/55 px-3 py-4 sm:my-10 sm:px-5"
      }
    >
      <p className="mb-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
        Advertisement
      </p>
      <div
        ref={containerRef}
        id={AD_CONTAINER_ID}
        className="mx-auto min-h-24 w-full max-w-5xl overflow-hidden text-center [overflow-wrap:anywhere] sm:min-h-28"
      />
    </aside>
  );
}
