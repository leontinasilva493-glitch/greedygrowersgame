import Link from "next/link";
import { ExternalLink, Sprout } from "lucide-react";

import { siteConfig } from "@/config/site";

const footerGroups = [
  {
    title: "Calculator",
    links: [
      { label: "Harvest calculator", href: "/" },
      { label: "When to harvest", href: "/guides/when-to-harvest" },
      { label: "Beginner guide", href: "/guides/beginner-guide" },
    ],
  },
  {
    title: "Evidence",
    links: [
      { label: "Seeds", href: "/seeds" },
      { label: "Lightning", href: "/lightning" },
      { label: "Data status", href: "/data-status" },
      { label: "Submit data", href: "/submit-data" },
    ],
  },
  {
    title: "Field notes",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Codes", href: "/codes" },
      { label: "Updates", href: "/updates" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-survey-line bg-surface/70">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 border-b border-dashed border-survey-line pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-3 rounded-[4px] font-display text-xl font-bold text-foreground transition-colors hover:text-lightning focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none"
            >
              <Sprout aria-hidden="true" className="size-6 text-grow" />
              Greedy Growers
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              A transparent field calculator for comparing a certain harvest
              with an uncertain wait.
            </p>
            <a
              href={siteConfig.robloxGameUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[4px] text-sm font-semibold text-lightning underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              Open the Roblox experience
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={`${group.title} links`}>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-grow">
                {group.title}
              </p>
              <ul className="mt-3 grid gap-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center rounded-[4px] text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="grid gap-3 pt-6 text-xs leading-5 text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-3xl">{siteConfig.disclaimer}</p>
          <p className="font-mono">Evidence audit: 2026-07-26</p>
        </div>
      </div>
    </footer>
  );
}
