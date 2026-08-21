export const GAME_IDS = ["deadline-dash", "stage-stack", "maze-chase"] as const;

export type GameId = (typeof GAME_IDS)[number];

export type GameDefinition = {
  id: GameId;
  title: string;
  shortDescription: string;
  version: string;
  embedPath: string;
  previewImage: string;
  scoreLabel: string;
  controlHint: string;
};

export const GAMES: Record<GameId, GameDefinition> = {
  "deadline-dash": {
    id: "deadline-dash",
    title: "Sober Parhawk",
    shortDescription: "Guide Parhawk through B-Dome's portico gates. One mistimed flap closes the run.",
    version: "3.0.0",
    embedPath: "/games/deadline-dash/index.html?embed=1",
    previewImage: "/media/arcade-cabinets/stage-flight-cover.svg",
    scoreLabel: "gates",
    controlHint: "Tap, click, or press space to fly.",
  },
  "stage-stack": {
    id: "stage-stack",
    title: "B-Dome Stack",
    shortDescription: "Drop clean blocks, build a streak, do not waste the lives.",
    version: "1.0.0",
    embedPath: "/games/stage-stack/index.html?embed=1",
    previewImage: "/media/arcade-cabinets/stage-stack-cover.png",
    scoreLabel: "points",
    controlHint: "Tap or click to release a block.",
  },
  "maze-chase": {
    id: "maze-chase",
    title: "Coco Chase",
    shortDescription: "Move through the circuit, collect bright ideas, and stay one step ahead.",
    version: "1.0.0",
    embedPath: "/games/maze-chase/index.html?embed=1",
    previewImage: "/media/arcade-cabinets/maze-chase-cover.png",
    scoreLabel: "points",
    controlHint: "Swipe or use the direction buttons / arrow keys.",
  },
};

export function isGameId(value: string): value is GameId {
  return GAME_IDS.includes(value as GameId);
}
