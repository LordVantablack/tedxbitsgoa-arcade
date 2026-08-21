import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TEDxBITSGoa Arcade",
    short_name: "TEDx Arcade",
    description: "Play, place on the board, and join the TEDxBITSGoa side quest.",
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#090909",
    icons: [
      { src: "/arcade-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/arcade-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
