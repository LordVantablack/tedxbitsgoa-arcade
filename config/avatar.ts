export const CHAMPION_TEMPLATES = [
  {
    id: "odyssey",
    name: "ODYSSEY",
    role: "BLUE BACK-PRINT TEE",
    origin: "A navy oversized tee with the blue winged figure and golden sun back print.",
    quirk: "GREAT CHANGE +5",
    stats: { idea: 5, chaos: 3, aura: 4 },
    spriteSrc: "/media/avatar-merch/v3/odyssey.png",
  },
  {
    id: "odyssey-female",
    name: "ODYSSEY / F",
    role: "BLUE BACK-PRINT TEE",
    origin: "A navy oversized tee with the blue winged figure and golden sun back print.",
    quirk: "GREAT CHANGE +5",
    stats: { idea: 5, chaos: 3, aura: 4 },
    spriteSrc: "/media/avatar-merch/v3/odyssey-female.png",
  },
  {
    id: "transcendence",
    name: "TRANSCENDENCE",
    role: "ORANGE BACK-PRINT TEE",
    origin: "A burnt-orange oversized tee with the red-and-cream winged bird back print.",
    quirk: "RISE ABOVE +5",
    stats: { idea: 4, chaos: 5, aura: 3 },
    spriteSrc: "/media/avatar-merch/v3/transcendence.png",
  },
  {
    id: "transcendence-female",
    name: "TRANSCENDENCE / F",
    role: "ORANGE BACK-PRINT TEE",
    origin: "A burnt-orange oversized tee with the red-and-cream winged bird back print.",
    quirk: "RISE ABOVE +5",
    stats: { idea: 4, chaos: 5, aura: 3 },
    spriteSrc: "/media/avatar-merch/v3/transcendence-female.png",
  },
] as const;

export type ChampionTemplate = (typeof CHAMPION_TEMPLATES)[number];
export type AvatarConfig = { template: ChampionTemplate["id"] };

export const DEFAULT_AVATAR: AvatarConfig = { template: "odyssey" };

export function championFor(avatar: AvatarConfig): ChampionTemplate {
  return CHAMPION_TEMPLATES.find((champion) => champion.id === avatar.template) ?? CHAMPION_TEMPLATES[0];
}

export function normalizeAvatar(value: unknown): AvatarConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_AVATAR;
  const template = (value as Record<string, unknown>).template;
  if (typeof template === "string" && CHAMPION_TEMPLATES.some((champion) => champion.id === template)) {
    return { template: template as AvatarConfig["template"] };
  }
  return DEFAULT_AVATAR;
}
