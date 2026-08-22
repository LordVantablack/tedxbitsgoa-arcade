import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("defines the TEDxBITSGoa arcade shell instead of the starter preview", async () => {
  const [page, layout, client, landing, leaderboard, nav, gameConfig, mazeManifest, appManifest, serviceWorker] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ArcadeClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/LandingClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/leaderboard/LeaderboardClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteNav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../config/games.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/games/maze-chase/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /title: "TEDxBITSGoa Arcade"/);
  assert.match(page, /<LandingClient \/>/);
  assert.match(client, /ARCADE \/ SELECT A CABINET/);
  assert.match(gameConfig, /Sober Parhawk/);
  assert.match(gameConfig, /B-Dome Stack/);
  assert.match(gameConfig, /Coco Chase/);
  assert.match(landing, /AVATAR/);
  assert.match(leaderboard, /HIGH/);
  assert.match(nav, /LEADERBOARD/);
  assert.doesNotMatch(nav, /GAME LAB/);
  assert.match(client, /SIGN IN TO PLAY/);
  assert.match(leaderboard, /YOUR VERIFIED PB/);
  assert.doesNotMatch(client, /PLAY DEMO/);
  assert.doesNotMatch(client, /run=.*preview/);
  assert.match(client, /activeGame && activeRun/);
  assert.match(mazeManifest, /Coco Chase/);
  assert.doesNotMatch(mazeManifest, /PacMan/);
  assert.match(appManifest, /TEDxBITSGoa Arcade/);
  assert.match(serviceWorker, /network-first/);
  assert.doesNotMatch(page + layout + client + landing, /SkeletonPreview|react-loading-skeleton|codex-preview/i);
});

test("lets BITS Goa players play while keeping the leaderboard 2026-only", async () => {
  const [campaign, startRun, finishRun, leaderboardRoute, meRoute, profileRoute, signin, avatarPage, landing, client, leaderboardClient, globals] = await Promise.all([
    readFile(new URL("../config/campaign.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/runs/start/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/runs/finish/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/leaderboards/[gameId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/me/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/signin/SignInClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/avatar/AvatarPageClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/LandingClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ArcadeClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/leaderboard/LeaderboardClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(campaign, /enabled: true/);
  assert.match(campaign, /\^f2026\\d\{4\}@goa\\\.bits-pilani\\\.ac\\\.in\$/);
  assert.match(campaign, /leaderboardEligibleEmailGlob/);
  assert.doesNotMatch(startRun, /isCampaignLive/);
  assert.doesNotMatch(startRun, /campaign is not live/);
  assert.doesNotMatch(startRun, /isLeaderboardEligibleEmail\(user\.email\)/);
  assert.doesNotMatch(finishRun, /isLeaderboardEligibleEmail\(user\.email\)/);
  assert.match(leaderboardRoute, /SELECT p\.handle AS displayName/);
  assert.match(leaderboardRoute, /LOWER\(p\.email\) GLOB/);
  assert.match(leaderboardRoute, /LENGTH\(p\.handle\) BETWEEN 3 AND 16/);
  assert.match(leaderboardRoute, /leaderboardEligible = isLeaderboardEligibleEmail\(session\.email\)/);
  assert.match(leaderboardRoute, /rank: number \| null/);
  assert.doesNotMatch(leaderboardRoute, /COALESCE\(p\.handle, p\.display_name\)/);
  assert.match(finishRun, /UPDATE run_tickets SET status = 'submitted'[\s\S]*AND status = 'issued'/);
  assert.match(finishRun, /UPDATE personal_bests[\s\S]*AND EXISTS \([\s\S]*status = 'submitted'[\s\S]*submitted_at = \?/);
  assert.match(finishRun, /const improved = \(result\[1\]\.meta\.changes \?\? 0\) === 1/);
  assert.doesNotMatch(finishRun, /ON CONFLICT\(game_id, google_subject\)/);
  assert.match(finishRun, /ORDER BY score DESC, achieved_at ASC/);
  assert.match(meRoute, /MAX\(score\) AS score/);
  assert.match(leaderboardRoute, /WITH best_scores AS/);
  assert.match(meRoute, /scores:/);
  assert.match(client, /setViewerScores/);
  assert.match(profileRoute, /\{2,15\}/);
  assert.match(client, /maxLength=\{16\}/);
  assert.match(client, /PRIVATE PB/);
  assert.match(signin, /router\.replace\("\/avatar"\)/);
  assert.match(avatarPage, /router\.push\("\/arcade"\)/);
  assert.match(landing, /profile-poster__avatar/);
  assert.match(signin, /Any BITS Goa account can play/);
  assert.match(client + leaderboardClient, /welcome-chip/);
  assert.match(globals, /leaderboard-page__grid[\s\S]*grid-template-columns:1fr/);
  const stageStack = await readFile(new URL("../public/games/stage-stack/index.html", import.meta.url), "utf8");
  assert.match(stageStack, /scoreable=Boolean\(query\.get\('run'\)&&query\.get\('run'\)!=='preview'\)/);
  assert.match(stageStack, /scoreable&&tedxRunStartedAt/);
  assert.match(stageStack, /type:'tedx:restart-game',gameId:'stage-stack'/);
  assert.doesNotMatch(finishRun, /validateDeadlineDash|validateStageStack|validateMazeChase/);
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
