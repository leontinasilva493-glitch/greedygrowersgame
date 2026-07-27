const base = new URL(process.argv[2] ?? "http://127.0.0.1:3421");
const routes = [
  "/",
  "/about",
  "/guides",
  "/guides/beginner-guide",
  "/guides/when-to-harvest",
  "/codes",
  "/updates",
  "/seeds",
  "/seeds/compare",
  "/lightning",
  "/data-status",
  "/submit-data",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];

const failures = [];
for (const route of routes) {
  const response = await fetch(new URL(route, base));
  if (response.status !== 200) failures.push(`${route}: expected 200, got ${response.status}`);
}

const redirect = await fetch(new URL("/calculator", base), { redirect: "manual" });
if (redirect.status !== 301 || redirect.headers.get("location") !== "/") {
  failures.push(`/calculator: expected 301 to /, got ${redirect.status} ${redirect.headers.get("location")}`);
}

const missing = await fetch(new URL("/seeds/not-a-real-seed", base));
if (missing.status !== 404) failures.push(`/seeds/not-a-real-seed: expected 404, got ${missing.status}`);

const sitemap = await (await fetch(new URL("/sitemap.xml", base))).text();
for (const forbidden of ["/submit-data", "/seeds/compare", "/privacy", "/terms"]) {
  if (sitemap.includes(forbidden)) failures.push(`sitemap unexpectedly contains ${forbidden}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Verified ${routes.length + 2} route contracts at ${base.origin}`);
