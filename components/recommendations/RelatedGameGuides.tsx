import {
  ArrowUpRight,
  Compass,
  Puzzle,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import {
  relatedGameRecommendations,
  type RelatedGameLink,
  type RelatedGameLinkGroup,
} from "@/features/recommendations/related-games";

const groupIcons: Record<RelatedGameLinkGroup["id"], LucideIcon> = {
  routes: Compass,
  puzzles: Puzzle,
  multiplayer: UsersRound,
};

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function RelatedGameGuides() {
  return (
    <section
      id="related-game-guides"
      className="mt-10 scroll-mt-24"
      aria-labelledby="related-game-guides-heading"
    >
      {relatedGameRecommendations.map((game) => (
        <div
          key={game.slug}
          data-related-game={game.slug}
          className="relative overflow-hidden border border-survey-line bg-surface shadow-[inset_0_1px_0_rgb(244_240_227_/_0.04)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-lightning via-grow to-survey-line"
          />

          <div className="grid gap-7 px-5 py-7 sm:px-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-9 lg:py-9">
            <div className="min-w-0 lg:border-r lg:border-dashed lg:border-survey-line lg:pr-9">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lightning">
                Other game field guide
              </p>
              <h2
                id="related-game-guides-heading"
                className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl"
              >
                Continue with another co-op adventure
              </h2>

              <div className="mt-6 border-l-2 border-grow pl-4">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-grow">
                  {game.category}
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold tracking-[-0.025em] text-foreground">
                  {game.name}
                </h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                  {game.summary}
                </p>
              </div>

              <a
                href={game.primaryLink.href}
                {...externalLinkProps}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[4px] bg-lightning px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-lightning/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none"
              >
                {game.primaryLink.label}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {game.primaryLink.description} Independent fan guide; opens in a new tab.
              </p>
            </div>

            <div className="grid min-w-0 gap-4">
              {game.groups.map((group) => (
                <ResourceGroup key={group.id} group={group} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function ResourceGroup({ group }: { group: RelatedGameLinkGroup }) {
  const Icon = groupIcons[group.id];

  return (
    <article className="border border-survey-line bg-background/55 px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center border border-survey-line bg-surface-raised text-lightning">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {group.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {group.description}
          </p>
        </div>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {group.links.map((link) => (
          <li key={link.href} className={group.links.length === 3 ? "last:sm:col-span-2" : undefined}>
            <ResourceLink link={link} />
          </li>
        ))}
      </ul>
    </article>
  );
}

function ResourceLink({ link }: { link: RelatedGameLink }) {
  return (
    <a
      href={link.href}
      aria-label={link.label}
      {...externalLinkProps}
      className="group flex h-full min-h-11 items-start justify-between gap-3 border-l border-dashed border-survey-line px-3 py-2 transition-colors hover:border-lightning hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 motion-reduce:transition-none"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground group-hover:text-lightning">
          {link.label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {link.description}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-lightning"
      />
    </a>
  );
}
