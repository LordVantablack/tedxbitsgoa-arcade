import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("defines the TEDxBITSGoa arcade shell instead of the starter preview", async () => {
  const [page, layout, client, gameConfig] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ArcadeClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../config/games.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /title: "TEDxBITSGoa Arcade"/);
  assert.match(page, /<ArcadeClient \/>/);
  assert.match(client, /THE 10-DAY RECRUITMENT SIDE QUEST/);
  assert.match(gameConfig, /Deadline Dash/);
  assert.match(gameConfig, /Stage Stack/);
  assert.match(gameConfig, /Maze Chase/);
  assert.doesNotMatch(page + layout + client, /SkeletonPreview|react-loading-skeleton|codex-preview/i);
});

test("keeps the scoreable game sources and database migration in the shipped project", async () => {
  const requiredPaths = [
    "public/games/deadline-dash/index.html",
    "public/games/stage-stack/index.html",
    "public/games/maze-chase/index.html",
    "drizzle/0000_opposite_doctor_octopus.sql",
    "drizzle/0001_massive_mac_gargan.sql",
    "docs/SECURITY-AND-SCORES.md",
  ];
  await Promise.all(requiredPaths.map((path) => access(new URL(`../${path}`, import.meta.url))));

  const [schema, gameConfig, auth] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../config/games.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/auth.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /personal_bests/);
  assert.match(schema, /run_tickets/);
  assert.match(gameConfig, /deadline-dash/);
  assert.match(gameConfig, /stage-stack/);
  assert.match(gameConfig, /maze-chase/);
  assert.match(auth, /goa\.bits-pilani\.ac\.in/);
});
