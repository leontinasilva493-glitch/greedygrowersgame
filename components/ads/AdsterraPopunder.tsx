"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAdEligibleRoute } from "./routes";

const SCRIPT_ID = "adsterra-popunder-script";
const SCRIPT_URL = "https://pl31199200.profitableratecpmnetwork.com/5a/57/ca/5a57ca988bdaec73c17f829159e9fab5.js";

export function AdsterraPopunder() {
  const pathname = usePathname();

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID);
    if (!isAdEligibleRoute(pathname)) {
      // Removing a script does not remove the vendor's document click handlers.
      // Reload the ad-free route to discard that execution context.
      if (existing) window.location.reload();
      return;
    }
    if (existing) return;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.head.append(script);
    // Keep one instance across client navigation; do not register duplicate handlers.
  }, [pathname]);

  return null;
}
