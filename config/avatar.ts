export const CHAMPION_TEMPLATES = [
  {
    id: "spark",
    name: "SPARK",
    role: "ENERGY DRINK ENTHUSIAST",
    origin: "Known to appear at the exact moment the group chat goes silent.",
    quirk: "CAFFEINE +5",
    stats: { idea: 4, chaos: 5, aura: 3 },
    spritePosition: "0% center",
  },
  {
    id: "afterhours",
    name: "AFTERHOURS",
    role: "DECK-BUILDING NIGHT OWL",
    origin: "Will say “one last iteration” with complete sincerity at 2:47 AM.",
    quirk: "SLIDE POLISH +5",
    stats: { idea: 5, chaos: 3, aura: 4 },
    spritePosition: "33.333% center",
  },
  {
    id: "sidequest",
    name: "SIDEQUEST",
    role: "CAMPUS LOREKEEPER",
    origin: "Knows the room, the people, and somehow the useful shortcut.",
    quirk: "SOCIAL BUFF +5",
    stats: { idea: 3, chaos: 4, aura: 5 },
    spritePosition: "66.666% center",
  },
  {
    id: "signal",
    name: "SIGNAL",
    role: "QUIETLY CRACKED CREATIVE",
    origin: "Rarely announces the plan. Usually makes it look much better.",
    quirk: "PIXEL PERFECT +5",
    stats: { idea: 5, chaos: 2, aura: 5 },
    spritePosition: "100% center",
  },
] as const;

export type ChampionTemplate = (typeof CHAMPION_TEMPLATES)[number];
export type AvatarConfig = { template: ChampionTemplate["id"] };

export const DEFAULT_AVATAR: AvatarConfig = { template: "spark" };

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
