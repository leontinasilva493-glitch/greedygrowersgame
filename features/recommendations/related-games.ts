export interface RelatedGameLink {
  label: string;
  href: `https://${string}`;
  description: string;
}

export interface RelatedGameLinkGroup {
  id: "routes" | "puzzles" | "multiplayer";
  title: string;
  description: string;
  links: readonly RelatedGameLink[];
}

export interface RelatedGameRecommendation {
  slug: string;
  name: string;
  category: string;
  summary: string;
  primaryLink: RelatedGameLink;
  groups: readonly RelatedGameLinkGroup[];
}

export const relatedGameRecommendations = [
  {
    slug: "big-walk",
    name: "Big Walk",
    category: "Co-op puzzle adventure",
    summary:
      "Switch from harvest decisions to a guide library built around Big Walk routes, puzzles, multiplayer setup, player-finding, and completion goals.",
    primaryLink: {
      label: "Big Walk walkthrough",
      href: "https://bigwalkwalkthrough.com/",
      description: "Open the main guide hub for walkthroughs, hints, and puzzle help.",
    },
    groups: [
      {
        id: "routes",
        title: "Routes and first steps",
        description: "Start cleanly, understand the route structure, and avoid losing early progress.",
        links: [
          {
            label: "Big Walk walkthroughs",
            href: "https://bigwalkwalkthrough.com/walkthrough",
            description: "Tower guides, routes, and progression help.",
          },
          {
            label: "First session tips",
            href: "https://bigwalkwalkthrough.com/beginner-guide",
            description: "Beginner setup, hosting, co-op, and save guidance.",
          },
        ],
      },
      {
        id: "puzzles",
        title: "Puzzles and challenges",
        description: "Move from broad puzzle help to the dedicated purple challenge checklist.",
        links: [
          {
            label: "Big Walk puzzle guide",
            href: "https://bigwalkwalkthrough.com/puzzles",
            description: "Puzzle locations, hints, and solution routes.",
          },
          {
            label: "All 7 purple challenges",
            href: "https://bigwalkwalkthrough.com/puzzles/purple-challenges",
            description: "A focused guide to every listed purple challenge location.",
          },
        ],
      },
      {
        id: "multiplayer",
        title: "Co-op and completion",
        description: "Check platform options, find a group, then close out the trophy list.",
        links: [
          {
            label: "Big Walk multiplayer",
            href: "https://bigwalkwalkthrough.com/multiplayer",
            description: "Crossplay, couch co-op, split screen, platforms, and join codes.",
          },
          {
            label: "Find Big Walk players",
            href: "https://bigwalkwalkthrough.com/multiplayer/how-to-find-players",
            description: "LFG and matchmaking options for joining a group.",
          },
          {
            label: "Big Walk trophy guide",
            href: "https://bigwalkwalkthrough.com/achievements",
            description: "All 13 achievements, including hidden trophies.",
          },
        ],
      },
    ],
  },
] as const satisfies readonly RelatedGameRecommendation[];
