export interface VideoEvidence {
  id: string;
  youtubeId: string;
  title: string;
  creator: string;
  publishedAt: string;
  duration: string;
  supports: string;
  doesNotProve: string;
}

export const lightningLossVideo: VideoEvidence = {
  id: "lightning-loss-video",
  youtubeId: "2WQha2gqexw",
  title: "I Lost EVERYTHING to Lightning Greedy Growers Roblox",
  creator: "MeowbooPlaysRoblox",
  publishedAt: "2026-07-27",
  duration: "4:30",
  supports: "A player-visible example of loss after waiting.",
  doesNotProve: "A lightning probability, universal harvest timer, or guaranteed outcome.",
};

export const mutationsGuideVideo: VideoEvidence = {
  id: "mutations-guide-video",
  youtubeId: "vFpqQJvbbBA",
  title: "ALL MUTATIONS GUIDE in Greedy Growers Roblox",
  creator: "Roblox Guides",
  publishedAt: "2026-07-29",
  duration: "5:53",
  supports: "The mutation claims players are currently discussing.",
  doesNotProve: "That every claimed trigger, multiplier, or rate is current-version verified.",
};
