"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CAMPAIGN } from "../config/campaign";
import { CHAMPION_TEMPLATES, DEFAULT_AVATAR, championFor, type AvatarConfig } from "../config/avatar";
import { GAMES, type GameDefinition, type GameId } from "../config/games";
import { THEME } from "../config/theme";
import { SiteNav } from "./SiteNav";

type Player = { email: string; displayName: string; handle: string | null; avatarId: string | null; avatar: AvatarConfig; leaderboardEligible: boolean } | null;
type LeaderboardEntry = { displayName: string; score: number; achievedAt: string };
type ViewerScore = { score: number; rank: number | null; leaderboardEligible: boolean } | null;
type StartedRun = { runId: string; gameId: GameId; gameVersion: string; seed: string; startedAt: number };
type GameMessage = {
  type: "tedx:game-over";
  gameId: GameId;
  score: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  evidence?: unknown;
};

export function ArcadeClient() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [notice, setNotice] = useState("Sign in, pick a cabinet, and make your PB count.");
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
  const [activeRun, setActiveRun] = useState<StartedRun | null>(null);
  const [viewerScores, setViewerScores] = useState<Partial<Record<GameId, ViewerScore>>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [profileError, setProfileError] = useState("");
  const gameFrameRef = useRef<HTMLIFrameElement>(null);

  const loadLeaderboards = useCallback(async () => {
    const loaded = await Promise.all(
      Object.values(GAMES).map(async (game) => {
        const response = await fetch(`/api/leaderboards/${game.id}`, { cache: "no-store" });
        if (!response.ok) return [game.id, { entries: [], viewer: null }] as const;
        const data = (await response.json()) as { entries: LeaderboardEntry[]; viewer?: ViewerScore };
        return [game.id, data] as const;
      }),
    );
    setViewerScores(Object.fromEntries(loaded.map(([gameId, data]) => [gameId, data.viewer ?? null])) as Partial<Record<GameId, ViewerScore>>);
  }, []);

  useEffect(() => {
    void fetch("/api/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { player: Player }) => {
        setPlayer(data.player);
        if (data.player) {
          setHandle(data.player.handle ?? "");
          setAvatar(data.player.avatar);
          if (!data.player.handle) {
            router.replace("/avatar");
          } else if (data.player.leaderboardEligible) {
            setNotice("You’re signed in and eligible for the public leaderboard.");
          } else {
            setNotice("You’re signed in. Your PBs are saved privately, but only f2026XXXX accounts appear on the leaderboard.");
          }
        }
      })
      .catch(() => setNotice("Could not check your sign-in status. Refresh once and try again."))
      .finally(() => setLoadingIdentity(false));
    const leaderboardTimer = window.setTimeout(() => void loadLeaderboards(), 0);
    return () => window.clearTimeout(leaderboardTimer);
  }, [loadLeaderboards, router]);

  const finishRun = useCallback(async (message: GameMessage) => {
    if (!activeRun || message.gameId !== activeRun.gameId) return;
    const response = await fetch("/api/runs/finish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        runId: activeRun.runId,
        gameId: activeRun.gameId,
        gameVersion: activeRun.gameVersion,
        score: Math.floor(message.score),
        durationMs: Math.max(1_000, Math.floor(message.durationMs ?? Date.now() - activeRun.startedAt)),
        metadata: message.metadata ?? {},
        evidence: message.evidence ?? null,
      }),
    });
    const data = (await response.json()) as { improved?: boolean; personalBest?: { score: number }; error?: string };
    if (!response.ok) {
      setNotice(data.error ?? "That run could not be verified. Start a fresh run and try again.");
      return;
    }
    setNotice(
      data.improved
        ? player?.leaderboardEligible
          ? `New personal best: ${data.personalBest?.score ?? message.score}. It’s now on the provisional board.`
          : `New personal best: ${data.personalBest?.score ?? message.score}. It’s saved privately to your account.`
        : `Score saved. Your PB stays at ${data.personalBest?.score ?? "its current mark"}.`,
    );
    setActiveRun(null);
    void loadLeaderboards();
  }, [activeRun, loadLeaderboards, player?.leaderboardEligible]);

  useEffect(() => {
    const receive = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || !event.data || typeof event.data !== "object") return;
      const message = event.data as Partial<GameMessage>;
      if (message.type !== "tedx:game-over" || typeof message.gameId !== "string" || typeof message.score !== "number") return;
      if (!(message.gameId in GAMES)) return;
      void finishRun(message as GameMessage);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [finishRun]);

  async function launchGame(game: GameDefinition) {
    if (!player) {
      router.push("/signin?returnTo=/avatar");
      return;
    }
    if (!player.handle) {
      router.push("/avatar");
      return;
    }
    const response = await fetch("/api/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ gameId: game.id }),
    });
    const data = (await response.json()) as Partial<StartedRun> & { issuedAt?: string; error?: string };
    if (!response.ok || !data.runId || !data.gameVersion || !data.seed || !data.issuedAt) {
      setNotice(data.error ?? "We could not start that run. Please try again.");
      return;
    }
    setActiveRun({
      runId: data.runId,
      gameId: game.id,
      gameVersion: data.gameVersion,
      seed: data.seed,
      startedAt: new Date(data.issuedAt).getTime(),
    });
    setActiveGame(game);
    setNotice(`${game.title} is live. Finish the run to save your personal best.`);
  }

  async function saveProfile() {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ handle, avatar }),
    });
    const data = (await response.json()) as { player?: NonNullable<Player>; error?: string };
    if (!response.ok || !data.player) {
      setProfileError(data.error ?? "Could not save your username.");
      return;
    }
    setPlayer(data.player);
    setProfileOpen(false);
    setProfileError("");
    setNotice(`Profile locked in. Welcome, ${data.player.handle}.`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setPlayer(null);
    setActiveGame(null);
    setActiveRun(null);
    setNotice("Signed out. Your verified scores remain safely attached to your account.");
  }

  function requestScoreRun(game: GameDefinition) {
    if (!player) {
      router.push("/signin?returnTo=/avatar");
      return;
    }
    if (!player.handle) {
      router.push("/avatar");
      return;
    }
    void launchGame(game);
  }

  return (
    <main className="arcade-shell experience">
      <div className="ambient" aria-hidden="true">{THEME.backgroundVideoSrc ? <video autoPlay muted loop playsInline poster="/og-arcade.png"><source src={THEME.backgroundVideoSrc} /></video> : null}</div>
      <SiteNav active="arcade" slot={<div className="identity" id="login">
          {loadingIdentity ? <span className="quiet">Checking access…</span> : player ? (
            <><button onClick={() => setProfileOpen(true)} className="profile-link">{player.handle ?? player.displayName}</button><button onClick={() => void logout()} className="text-button">Sign out</button></>
          ) : <Link className="nav-login" href="/signin?returnTo=/avatar">SIGN IN</Link>}
        </div>} />

      <section className="hero" id="top"><p className="eyebrow">ARCADE / SELECT A CABINET</p><h1>ONE MORE<br /><i>RUN.</i></h1>
        <p className="hero-copy">Three quick cabinets, one verified BITS Goa identity, and leaderboards that actually mean something.</p>
        <p className="status" role="status">{notice}</p>
      </section>

      <section className="cabinet-grid" aria-label="Games">
        {Object.values(GAMES).map((game, index) => (
          <article className="arcade-machine" key={game.id}>
            <div className="arcade-machine__visual">
              <button className="arcade-machine__screen" type="button" onClick={() => requestScoreRun(game)} aria-label={`${gameActionLabel(player)} ${game.title}`}>
                <img src={game.previewImage} alt="" />
                <span className="arcade-machine__screen-shade" aria-hidden="true" />
                <span className="arcade-machine__screen-logo" aria-hidden="true">{cabinetWordmark(game.id)}</span>
                <span className="arcade-machine__screen-prompt" aria-hidden="true">{gameActionLabel(player)}</span>
              </button>
              <span className="arcade-machine__marquee" aria-hidden="true">{cabinetWordmark(game.id)}</span>
              <img className="arcade-machine__shell" src={cabinetShell(game.id)} alt="" aria-hidden="true" />
            </div>
            <div className="arcade-machine__actions">
              <button type="button" onClick={() => requestScoreRun(game)}>{gameActionLabel(player)}</button>
            </div>
            <p className="arcade-machine__rank" aria-live="polite">0{index + 1} · {leaderboardPlaque(player, viewerScores[game.id] ?? null)}</p>
          </article>
        ))}
      </section>

      <section className="arcade-group-actions" aria-label="Arcade account and leaderboard actions">
        {player ? <button className="control-tile is-selected" onClick={() => setProfileOpen(true)}><i aria-hidden="true">▶</i><b>SIGNED IN AS {player.handle ?? player.displayName}</b></button> : <Link className="control-tile is-selected" href="/signin?returnTo=/avatar"><i aria-hidden="true">▶</i><b>SIGN IN WITH BITS GOA</b></Link>}
        <Link className="control-tile" href="/leaderboard"><i aria-hidden="true">▶</i><b>CHECK LEADERBOARD</b></Link>
      </section>

      <section className="rules">
        <p><strong>How it works:</strong> every verified BITS Goa player can save PBs. Public Top 10 boards only show eligible 2026-batch usernames and remain provisional until the campaign closes.</p>
        {CAMPAIGN.registrationUrl ? <a href={CAMPAIGN.registrationUrl} target="_blank" rel="noreferrer">Open the induction form ↗</a> : null}
      </section>

      {activeGame ? (
        <div className="game-modal" role="dialog" aria-modal="true" aria-label={`${activeGame.title} game`}>
          <div className="game-modal-bar">
            <div><strong>{activeGame.title}</strong><span>Scoreable run active</span></div>
            <button className="text-button" onClick={() => setActiveGame(null)}>Close cabinet</button>
          </div>
          <iframe
            ref={gameFrameRef}
            title={activeGame.title}
            src={`${activeGame.embedPath}&run=${encodeURIComponent(activeRun?.runId ?? "preview")}&seed=${encodeURIComponent(activeRun?.seed ?? "")}&pb=${encodeURIComponent(String(viewerScores[activeGame.id]?.score ?? 0))}`}
            className="game-frame"
            tabIndex={0}
            onLoad={() => gameFrameRef.current?.focus()}
            allow="fullscreen"
          />
        </div>
      ) : null}
      {profileOpen ? <AvatarStudio handle={handle} avatar={avatar} error={profileError} onHandle={setHandle} onAvatar={setAvatar} onSave={() => void saveProfile()} /> : null}
    </main>
  );
}

export function AvatarStudio({ handle, avatar, error, onHandle, onAvatar, onSave }: { handle: string; avatar: AvatarConfig; error: string; onHandle: (value: string) => void; onAvatar: (value: AvatarConfig) => void; onSave: () => void }) {
  const champion = championFor(avatar);
  return <div className="profile-overlay" role="dialog" aria-modal="true" aria-label="Create your arcade profile"><div className="profile-modal avatar-studio"><section className="avatar-preview-panel"><p>PLAYER CARD / 01</p><AvatarPreview avatar={avatar} /><small>FULL-BODY TEDx FIT · TEMPLATE ART CAN BE REPLACED LATER</small></section><section className="avatar-controls"><p>PROFILE SETUP / CHOOSE YOUR CHAMPION</p><h2>BUILD YOUR<br /><em>PLAYER.</em></h2><label>PUBLIC USERNAME · 16 CHARACTERS MAX<input value={handle} maxLength={16} placeholder="e.g. stageleft" onChange={(event) => onHandle(event.target.value)} /></label><div className="champion-picker" aria-label="Champion template">{CHAMPION_TEMPLATES.map((template) => <button type="button" key={template.id} className={avatar.template === template.id ? "is-selected" : ""} onClick={() => onAvatar({ template: template.id })}><ChampionSprite champion={template} /><span>{template.name}</span></button>)}</div><section className="champion-lore"><p>{champion.name} <span>{champion.role}</span></p><blockquote>{champion.origin}</blockquote><strong>{champion.quirk}</strong><div className="champion-stats">{Object.entries(champion.stats).map(([stat, amount]) => <span key={stat}>{stat}<i>{"■".repeat(amount)}{"□".repeat(5 - amount)}</i></span>)}</div></section>{error ? <p className="profile-error">{error}</p> : null}<button className="big-button big-button--red" onClick={onSave}>LOCK IN PLAYER CARD <span>→</span></button><small>Your Google name stays private. Only this username appears on the leaderboard.</small></section></div></div>;
}

function AvatarPreview({ avatar }: { avatar: AvatarConfig }) {
  const champion = championFor(avatar);
  return <div className="champion-preview" aria-label={`${champion.name} full-body pixel avatar preview`}><ChampionSprite champion={champion} /><span className="pixel-avatar-scan" /><span className="champion-preview__tag">TEDx / {champion.name}</span></div>;
}

function ChampionSprite({ champion }: { champion: ReturnType<typeof championFor> }) {
  return <span className="champion-sprite" style={{ backgroundImage: `url(${champion.spriteSrc})` }} aria-hidden="true" />;
}

function cabinetWordmark(gameId: GameId) {
  return { "deadline-dash": "SOBER PARHAWK", "stage-stack": "B-DOME STACK", "maze-chase": "COCO CHASE" }[gameId];
}

function cabinetShell(gameId: GameId) {
  return {
    "deadline-dash": "/media/arcade-cabinets/deadline-dash-shell.png",
    "stage-stack": "/media/arcade-cabinets/stage-stack-shell.png",
    "maze-chase": "/media/arcade-cabinets/idea-circuit-shell.png",
  }[gameId];
}

function leaderboardPlaque(player: Player, personalBest: ViewerScore) {
  if (!player) return "SIGN IN TO TRACK YOUR RANK";
  if (!player.handle) return "CHOOSE A USERNAME TO SAVE PBS";
  if (!player.leaderboardEligible) return personalBest ? `PRIVATE PB ${personalBest.score}` : "PB SAVED PRIVATELY";
  return personalBest?.rank ? `PB ${personalBest.score} · YOU ARE #${personalBest.rank}` : "NO VERIFIED PB YET";
}

function gameActionLabel(player: Player) {
  if (!player) return "SIGN IN TO PLAY";
  if (!player.handle) return "SET UP PROFILE";
  return "SCORE RUN";
}
