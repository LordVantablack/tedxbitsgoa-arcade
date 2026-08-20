import type { GameId } from "../config/games";
import { ApiError } from "./http";

export type RunPayload = {
  score: number;
  durationMs: number;
  metadata: Record<string, unknown>;
  evidence: unknown;
};

const MAX_EVIDENCE_BYTES = 64_000;

export function validateRunPayload(gameId: GameId, payload: RunPayload): string | null {
  if (!Number.isSafeInteger(payload.score) || payload.score < 0 || payload.score > 9_999_999) {
    throw new ApiError(400, "Score must be a whole number in the accepted range.");
  }
  if (!Number.isSafeInteger(payload.durationMs) || payload.durationMs < 1_000 || payload.durationMs > 7_200_000) {
    throw new ApiError(400, "Run duration is outside the accepted range.");
  }

  const evidenceJson = JSON.stringify(payload.evidence ?? null);
  if (new TextEncoder().encode(evidenceJson).byteLength > MAX_EVIDENCE_BYTES) {
    throw new ApiError(400, "Run evidence is too large.");
  }

  switch (gameId) {
    case "deadline-dash":
      validateDeadlineDash(payload);
      break;
    case "stage-stack":
      validateStageStack(payload);
      break;
    case "maze-chase":
      validateMazeChase(payload);
      break;
  }

  return evidenceJson;
}

function validateDeadlineDash({ score, durationMs, metadata }: RunPayload): void {
  const jumps = readNonNegativeInt(metadata.jumps, "jumps", 20_000);
  const maxPlausibleScore = Math.floor(durationMs / 1_000) * 200 + 1_000;
  if (score > maxPlausibleScore || jumps > Math.ceil(durationMs / 80)) {
    throw new ApiError(422, "This runner score does not match the recorded run pace.");
  }
}

function validateStageStack({ score, durationMs, metadata }: RunPayload): void {
  const rawPlacements = metadata.placements;
  const misses = readNonNegativeInt(metadata.misses, "misses", 3);
  if (!Array.isArray(rawPlacements) || rawPlacements.length > 5_000) {
    throw new ApiError(422, "Stage Stack needs its placement record.");
  }
  if (rawPlacements.length > Math.ceil(durationMs / 60)) {
    throw new ApiError(422, "Too many placements were recorded for this run.");
  }

  let expectedScore = 0;
  let perfectStreak = 0;
  for (const placement of rawPlacements) {
    if (!placement || typeof placement !== "object" || Array.isArray(placement)) {
      throw new ApiError(422, "Stage Stack placement data is invalid.");
    }
    const perfect = (placement as Record<string, unknown>).perfect === true;
    perfectStreak = perfect ? perfectStreak + 1 : 0;
    expectedScore += 25 + (perfect ? 25 * perfectStreak : 0);
  }
  if (misses > 3 || score !== expectedScore) {
    throw new ApiError(422, "This Stage Stack score does not match its placements.");
  }
}

function validateMazeChase({ score, durationMs, metadata }: RunPayload): void {
  const level = readNonNegativeInt(metadata.level, "level", 50);
  const inputCount = readNonNegativeInt(metadata.inputCount, "inputCount", 30_000);
  const maxPlausibleScore = Math.max(2_000, level * 30_000 + Math.floor(durationMs / 1_000) * 800);
  if (level < 1 || score > maxPlausibleScore || inputCount > Math.ceil(durationMs / 25)) {
    throw new ApiError(422, "This maze score does not match the recorded run.");
  }
}

function readNonNegativeInt(value: unknown, label: string, max: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > max) {
    throw new ApiError(422, `${label} is outside the accepted range.`);
  }
  return value as number;
}
