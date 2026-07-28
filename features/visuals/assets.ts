export interface GameSceneAsset {
  id: "home" | "seeds" | "lightning" | "beginner";
  src: `/media/greedy-growers/scenes/${string}.webp`;
  width: 1536;
  height: 1024;
  alt: string;
  caption: string;
  route: "/" | "/seeds" | "/lightning" | "/guides/beginner-guide";
  sourceType: "original-illustration";
  createdAt: "2026-07-27";
  rightsStatus: "owned";
  rightsNote: string;
  focalPoint: `${number}% ${number}%`;
}

export const gameSceneAssets = {
  home: {
    id: "home",
    src: "/media/greedy-growers/scenes/growth-vs-lightning.webp",
    width: 1536,
    height: 1024,
    alt: "Fan-made low-poly illustration of a thriving fruit tree beside a lightning-struck tree",
    caption:
      "Original site illustration of growth versus lightning risk. Not gameplay footage.",
    route: "/",
    sourceType: "original-illustration",
    createdAt: "2026-07-27",
    rightsStatus: "owned",
    rightsNote: "Original artwork generated for this fan-made guide.",
    focalPoint: "50% 54%",
  },
  seeds: {
    id: "seeds",
    src: "/media/greedy-growers/scenes/river-seed-plots.webp",
    width: 1536,
    height: 1024,
    alt: "Fan-made low-poly illustration of a riverside seed stall beside planting plots and young trees",
    caption:
      "Original site illustration of the seed-to-plot context. Not gameplay footage.",
    route: "/seeds",
    sourceType: "original-illustration",
    createdAt: "2026-07-27",
    rightsStatus: "owned",
    rightsNote: "Original artwork generated for this fan-made guide.",
    focalPoint: "50% 58%",
  },
  lightning: {
    id: "lightning",
    src: "/media/greedy-growers/scenes/lightning-cycle.webp",
    width: 1536,
    height: 1024,
    alt: "Fan-made low-poly illustration of a healthy tree, a lightning strike, and a charred tree",
    caption:
      "Original site illustration of a possible strike sequence. Not gameplay footage.",
    route: "/lightning",
    sourceType: "original-illustration",
    createdAt: "2026-07-27",
    rightsStatus: "owned",
    rightsNote: "Original artwork generated for this fan-made guide.",
    focalPoint: "50% 48%",
  },
  beginner: {
    id: "beginner",
    src: "/media/greedy-growers/scenes/beginner-loop.webp",
    width: 1536,
    height: 1024,
    alt: "Fan-made low-poly illustration of choosing a seed, planting a plot, growing a tree, and facing a storm",
    caption:
      "Original site illustration of the confirmed beginner loop. Not gameplay footage.",
    route: "/guides/beginner-guide",
    sourceType: "original-illustration",
    createdAt: "2026-07-27",
    rightsStatus: "owned",
    rightsNote: "Original artwork generated for this fan-made guide.",
    focalPoint: "50% 56%",
  },
} as const satisfies Record<GameSceneAsset["id"], GameSceneAsset>;
