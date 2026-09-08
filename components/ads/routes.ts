const AD_FREE_ROUTES = new Set([
  "/contact", "/data-status", "/privacy", "/submit-data", "/terms",
]);

export function isAdEligibleRoute(pathname: string): boolean {
  return !AD_FREE_ROUTES.has(pathname.replace(/\/+$/, "") || "/");
}
