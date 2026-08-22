import type { GameId } from "../config/games";
import { ApiError } from "./http";

export type RunPayload = {
  score: number;
  metadata: Record<string, unknown>;
  evidence: unknown;
};

const MAX_EVIDENCE_BYTES = 64_000;

export function validateRunPayload(gameId: GameId, payload: RunPayload): string | null {
  void gameId;
  if (!Number.isSafeInteger(payload.score) || payload.score < 0 || payload.score > 9_999_999) {
    throw new ApiError(400, "Score must be a whole number in the accepted range.");
  }
  if (payload.evidence == null) return null;
  const evidenceJson = JSON.stringify(payload.evidence);
  if (new TextEncoder().encode(evidenceJson).byteLength > MAX_EVIDENCE_BYTES) {
    throw new ApiError(400, "Run evidence is too large.");
  }

  return evidenceJson;
}
