import { env } from "cloudflare:workers";

export type ArcadeEnv = {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  SESSION_SECRET?: string;
  ADMIN_EMAILS?: string;
};

export function getRuntimeEnv(): ArcadeEnv {
  return env as unknown as ArcadeEnv;
}
