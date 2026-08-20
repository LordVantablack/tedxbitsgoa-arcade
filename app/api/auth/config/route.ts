import { getRuntimeEnv } from "../../../../lib/runtime";

export const runtime = "edge";

export async function GET() {
  const clientId = getRuntimeEnv().GOOGLE_CLIENT_ID;
  return Response.json({ googleClientId: clientId ?? null });
}
