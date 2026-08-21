/**
 * The small, semantic asset registry for the arcade shell.
 *
 * It deliberately names what an asset does, not the upstream filename. New
 * art can therefore replace an old asset without changing product code.
 */
export const THEME = {
  shell: { accent: "#e62b1e", paper: "#f7f3ed", ink: "#171414" },
  socialCard: "/og-arcade.png",
  // Homepage hero media. Replace the orientation URLs when the final video is ready.
  heroPosterSrc: "/media/tedxbitsgoa-coming-soon-poster.jpg",
  orientationVideoUrl: "",
  orientationVideoEmbedUrl: "",
  // Drop an approved MP4/WebM under public/media and put its public path here.
  // An empty value deliberately uses the CSS fallback, including reduced-motion.
  backgroundVideoSrc: "",
  // Transparent PNG supplied by the TEDxBITSGoa team. It overlays the avatar torso.
  merchShirtSrc: "",
  instagramUrl: "https://www.instagram.com/tedxbitsgoa/",
  gameLabels: {
    "deadline-dash": "Sober Parhawk",
    "stage-stack": "B-Dome Stack",
    "maze-chase": "Coco Chase",
  },
} as const;
