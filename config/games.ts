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
    shortDescription: "Tap to keep Parhawk flying through the D spine; avoid the columns and survive as long as you can.",
    version: "3.1.0",
    embedPath: "/games/deadline-dash/index.html?embed=1",
    previewImage: "/media/arcade-cabinets/stage-flight-cover.svg",
    scoreLabel: "gates",
    controlHint: "Tap, click, or press space to fly.",
  },
  "stage-stack": {
    id: "stage-stack",
    title: "B-Dome Stack",
    shortDescription: "Drop each moving block neatly onto the tower. Cleaner landings build better streaks; messy drops cost lives.",
    version: "1.1.0",
    embedPath: "/games/stage-stack/index.html?embed=1",
    previewImage: "/media/arcade-cabinets/stage-stack-cover.png",
    scoreLabel: "points",
    controlHint: "Tap or click to release a block.",
  },
  "maze-chase": {
    id: "maze-chase",
    title: "Coco Chase",
    shortDescription: "Press Start Game, then swipe through the maze to collect bright ideas while staying ahead of the chasers.",
    version: "1.1.0",
    embedPath: "/games/maze-chase/index.html?embed=1",
    previewImage: "/media/arcade-cabinets/maze-chase-cover.png",
    scoreLabel: "points",
    controlHint: "Press Start Game, then swipe on phone or use arrow keys on laptop.",
  },
};

export function isGameId(value: string): value is GameId {
  return GAME_IDS.includes(value as GameId);
}
