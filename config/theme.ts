/**
 * The small, semantic asset registry for the arcade shell.
 *
 * It deliberately names what an asset does, not the upstream filename. New
 * art can therefore replace an old asset without changing product code.
 */
export const THEME = {
  shell: { accent: "#e62b1e", paper: "#f7f3ed", ink: "#171414" },
  socialCard: "/og-arcade.png",
  gameLabels: {
    "deadline-dash": "Deadline Dash",
    "stage-stack": "Stage Stack",
    "maze-chase": "Maze Chase",
  },
} as const;
