export const GAME_IDS = ["deadline-dash", "stage-stack", "maze-chase"] as const;

export type GameId = (typeof GAME_IDS)[number];

export type GameDefinition = {
  id: GameId;
  title: string;
  shortDescription: string;
  version: string;
  embedPath: string;
  scoreLabel: string;
  controlHint: string;
};

export const GAMES: Record<GameId, GameDefinition> = {
  "deadline-dash": {
    id: "deadline-dash",
    title: "Deadline Dash",
    shortDescription: "Keep moving. One mistimed jump and the run is over.",
    version: "1.0.0",
    embedPath: "/games/deadline-dash/index.html?embed=1",
    scoreLabel: "distance",
    controlHint: "Tap, click, or press space to jump.",
  },
  "stage-stack": {
    id: "stage-stack",
    title: "Stage Stack",
    shortDescription: "Drop clean blocks, build a streak, do not waste the lives.",
    version: "1.0.0",
    embedPath: "/games/stage-stack/index.html?embed=1",
    scoreLabel: "points",
    controlHint: "Tap or click to release a block.",
  },
  "maze-chase": {
    id: "maze-chase",
    title: "Maze Chase",
    shortDescription: "The familiar maze chase, with a score that keeps climbing.",
    version: "1.0.0",
    embedPath: "/games/maze-chase/index.html?embed=1",
    scoreLabel: "points",
    controlHint: "Swipe or use the direction buttons / arrow keys.",
  },
};

export function isGameId(value: string): value is GameId {
  return GAME_IDS.includes(value as GameId);
}
