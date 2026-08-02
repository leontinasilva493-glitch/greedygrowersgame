import Link from "next/link";
import { ExternalLink, Menu, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { MobileNavigationLink } from "./MobileNavigationLink";

const mobilePrimaryLinks = siteConfig.navigation.filter(({ label }) =>
  ["Calculator", "Seeds", "Guides"].includes(label),
);
const mobileMoreLinks = siteConfig.navigation.filter(({ label }) =>
  ["Lightning", "Codes", "Updates"].includes(label),
);

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-survey-line/90 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[68px] max-w-[1180px] items-center gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="mr-auto flex min-h-11 min-w-0 items-center gap-2.5 rounded-[4px] font-display font-bold tracking-[-0.02em] text-foreground transition-colors hover:text-lightning focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 motion-reduce:transition-none"
          aria-label="Greedy Growers Calculator home"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[4px] border border-grow/60 bg-surface-raised text-grow shadow-[inset_0_1px_0_rgb(244_240_227_/_0.08)]">
            <Sprout aria-hidden="true" className="size-5" strokeWidth={1.9} />
          </span>
          <span className="truncate text-lg sm:hidden">GG Calc</span>
          <span className="hidden truncate text-xl sm:inline">
            Greedy Growers
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center lg:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-[4px] px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <details className="group relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[4px] border border-survey-line bg-surface px-3 text-sm font-semibold text-foreground transition-colors hover:border-lightning/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="size-5" />
            <span className="hidden min-[390px]:inline">Menu</span>
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] max-h-[calc(100vh-6rem)] w-[min(19rem,calc(100vw-2rem))] overflow-auto rounded-[6px] border border-survey-line bg-surface-raised p-3 shadow-[0_18px_50px_rgb(0_0_0_/_0.35)]">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {mobilePrimaryLinks.map((item) => (
                <MobileNavigationLink
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-[4px] px-3 font-semibold text-foreground transition-colors hover:bg-surface hover:text-lightning focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none"
                >
                  {item.label}
                </MobileNavigationLink>
              ))}
              <p className="mt-2 border-t border-dashed border-survey-line px-3 pt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                More field notes
              </p>
              {mobileMoreLinks.map((item) => (
                <MobileNavigationLink
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-[4px] px-3 font-semibold text-foreground transition-colors hover:bg-surface hover:text-lightning focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none"
                >
                  {item.label}
                </MobileNavigationLink>
              ))}
            </nav>
          </div>
        </details>

        <Button asChild size="sm" className="px-3 sm:px-4">
          <a
            href={siteConfig.robloxGameUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span className="sm:hidden">Play</span>
            <span className="hidden sm:inline">Play on Roblox</span>
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}
