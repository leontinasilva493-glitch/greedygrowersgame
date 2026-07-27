import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Greedy Growers Calculator",
    short_name: "GG Calculator",
    description: "Fan-made harvest decision calculator and evidence-backed data guide.",
    start_url: "/",
    display: "standalone",
    background_color: "#08110f",
    theme_color: "#08110f",
    icons: [{ src: "/brand/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
