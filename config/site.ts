export const LOCAL_DEVELOPMENT_ORIGIN = "http://localhost:3000";
export const PRODUCTION_ORIGIN = "https://greedygrowersgame.com";
export const OFFICIAL_ROBLOX_GAME_URL =
  "https://www.roblox.com/games/74102906764176/Greedy-Growers";

export interface SiteEnvironment {
  readonly [key: string]: string | undefined;
  NODE_ENV?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_SUPPORT_EMAIL?: string;
  VERCEL_ENV?: string;
}

export interface SiteNavigationItem {
  label: string;
  href: `/${string}` | "/";
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  origin: string;
  locale: "en";
  themeColor: `#${string}`;
  supportEmail: string | null;
  robloxGameUrl: string;
  disclaimer: string;
  navigation: readonly SiteNavigationItem[];
}

const legacyBrandTerms = [
  ["crazy", "cattle"].join(" "),
  ["crazy", "cattle"].join(""),
  ["un", "blocked"].join(""),
  ["free", "_un", "blocked_games"].join(""),
  ["crazy-", "cattle.net"].join(""),
];

export function assertBrandSafeCopy(value: string): void {
  const normalized = value.toLocaleLowerCase("en-US");
  const match = legacyBrandTerms.find((term) => normalized.includes(term));

  if (match) {
    throw new Error(`Site copy contains a legacy brand term: ${match}`);
  }
}

function resolveOrigin(environment: SiteEnvironment): string {
  const isProduction =
    environment.NODE_ENV === "production" ||
    environment.VERCEL_ENV === "production";
  const configuredOrigin = environment.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredOrigin) {
    return isProduction ? PRODUCTION_ORIGIN : LOCAL_DEVELOPMENT_ORIGIN;
  }

  let url: URL;

  try {
    url = new URL(configuredOrigin);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTP(S) origin.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTP(S) origin.");
  }

  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin without credentials, path, query, or hash.",
    );
  }

  if (isProduction && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in Vercel production.");
  }

  return url.origin;
}

function resolveSupportEmail(value: string | undefined): string | null {
  const email = value?.trim();

  if (!email) {
    return null;
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const domain = email.split("@").at(-1)?.toLocaleLowerCase("en-US");
  const isPlaceholder =
    domain === "example.com" ||
    domain === "example.org" ||
    domain === "example.net";

  if (!isEmail || isPlaceholder) {
    throw new Error(
      "NEXT_PUBLIC_SUPPORT_EMAIL must be a real support email or remain unset.",
    );
  }

  return email;
}

export function createSiteConfig(
  environment: SiteEnvironment = process.env,
): SiteConfig {
  const config: SiteConfig = {
    name: "Greedy Growers Calculator",
    title: "Greedy Growers Calculator: Harvest Now or Wait?",
    description:
      "Use the Greedy Growers Calculator to compare harvest value, wait value, and lightning risk, see the break-even point, and decide whether to harvest or wait.",
    origin: resolveOrigin(environment),
    locale: "en",
    themeColor: "#08110F",
    supportEmail: resolveSupportEmail(environment.NEXT_PUBLIC_SUPPORT_EMAIL),
    robloxGameUrl: OFFICIAL_ROBLOX_GAME_URL,
    disclaimer:
      "This fan-made resource is not affiliated with Roblox Corporation or the creators of Greedy Growers.",
    navigation: [
      { label: "Calculator", href: "/#calculator" },
      { label: "Seeds", href: "/seeds" },
      { label: "Lightning", href: "/lightning" },
      { label: "Guides", href: "/guides" },
      { label: "Codes", href: "/codes" },
      { label: "Updates", href: "/updates" },
    ],
  };

  assertBrandSafeCopy(JSON.stringify(config));

  return config;
}

export const siteConfig = createSiteConfig();
