"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CAMPAIGN } from "../config/campaign";
import { CHAMPION_TEMPLATES, DEFAULT_AVATAR, championFor, type AvatarConfig } from "../config/avatar";
import { GAMES, type GameDefinition, type GameId } from "../config/games";
import { THEME } from "../config/theme";

type Player = { email: string; displayName: string; handle: string | null; avatarId: string | null; avatar: AvatarConfig } | null;
type LeaderboardEntry = { displayName: string; score: number; achievedAt: string };
type StartedRun = { runId: string; gameId: GameId; gameVersion: string; seed: string; startedAt: number };
type GameMessage = {
  type: "tedx:game-over";
  gameId: GameId;
  score: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  evidence?: unknown;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (response: { credential: string }) => void; hosted_domain?: string }): void;
          renderButton(element: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
  }
}

export function ArcadeClient() {
  const [player, setPlayer] = useState<Player>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [notice, setNotice] = useState("Sign in, pick a cabinet, and make your PB count.");
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
  const [activeRun, setActiveRun] = useState<StartedRun | null>(null);
  const [leaderboards, setLeaderboards] = useState<Partial<Record<GameId, LeaderboardEntry[]>>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [profileError, setProfileError] = useState("");
  const buttonRef = useRef<HTMLDivElement>(null);

  const loadLeaderboards = useCallback(async () => {
    const loaded = await Promise.all(
      Object.values(GAMES).map(async (game) => {
        const response = await fetch(`/api/leaderboards/${game.id}`, { cache: "no-store" });
        if (!response.ok) return [game.id, []] as const;
        const data = (await response.json()) as { entries: LeaderboardEntry[] };
        return [game.id, data.entries] as const;
      }),
    );
    setLeaderboards(Object.fromEntries(loaded) as Partial<Record<GameId, LeaderboardEntry[]>>);
  }, []);

  const onCredential = useCallback(async (credential: string) => {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ credential }),
    });
    const data = (await response.json()) as { player?: Player; error?: string };
    if (!response.ok || !data.player) {
      setNotice(data.error ?? "We could not sign you in. Try your BITS Goa account again.");
      return;
    }
    const me = await fetch("/api/me", { cache: "no-store" }).then((result) => result.json()) as { player: Player };
    setPlayer(me.player);
    if (me.player) {
      setHandle(me.player.handle ?? "");
      setAvatar(me.player.avatar);
    }
    if (me.player && !me.player.handle) setProfileOpen(true);
    setNotice(`You’re in, ${data.player.displayName.split(" ")[0]}. Pick a callsign before your first qualifying run.`);
  }, []);

  useEffect(() => {
    void fetch("/api/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { player: Player }) => {
        setPlayer(data.player);
        if (data.player) {
          setHandle(data.player.handle ?? "");
          setAvatar(data.player.avatar);
          if (!data.player.handle) setProfileOpen(true);
        }
      })
      .catch(() => setNotice("Could not check your sign-in status. Refresh once and try again."))
      .finally(() => setLoadingIdentity(false));
    const leaderboardTimer = window.setTimeout(() => void loadLeaderboards(), 0);
    return () => window.clearTimeout(leaderboardTimer);
  }, [loadLeaderboards]);

  useEffect(() => {
    if (!buttonRef.current || player) return;
    let disposed = false;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = async () => {
      const response = await fetch("/api/auth/config", { cache: "no-store" });
      const { googleClientId } = (await response.json()) as { googleClientId: string | null };
      if (disposed || !googleClientId || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        hosted_domain: CAMPAIGN.allowedGoogleWorkspaceDomain,
        callback: ({ credential }) => void onCredential(credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 280,
      });
    };
    document.head.appendChild(script);
    return () => {
      disposed = true;
      script.remove();
    };
  }, [onCredential, player]);

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
        ? `New personal best: ${data.personalBest?.score ?? message.score}. It’s now on the provisional board.`
        : `Score saved. Your PB stays at ${data.personalBest?.score ?? "its current mark"}.`,
    );
    setActiveRun(null);
    void loadLeaderboards();
  }, [activeRun, loadLeaderboards]);

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
      setNotice("Sign in with your BITS Goa Google account before starting a scoreable run.");
      return;
    }
    if (!player.handle) {
      setProfileOpen(true);
      setNotice("Choose a callsign before starting a qualifying run.");
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
    setNotice(`${game.title} is live. Finish the run to send your score for verification.`);
  }

  function launchDemo(game: GameDefinition) {
    setActiveRun(null);
    setActiveGame(game);
    setNotice(`${game.title} demo mode — have a go. Sign in to submit a qualifying score.`);
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
      setProfileError(data.error ?? "Could not save your callsign.");
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

  return (
    <main className="arcade-shell experience">
      <div className="ambient" aria-hidden="true">{THEME.backgroundVideoSrc ? <video autoPlay muted loop playsInline poster="/og-arcade.png"><source src={THEME.backgroundVideoSrc} /></video> : null}</div>
      <header className="arcade-header site-nav">
        <Link className="wordmark brand" href="/" aria-label="TEDxBITSGoa Arcade home">
          <span>TEDx</span>BITSGoa <em>ARCADE</em>
        </Link>
        <nav><a href="/arcade">ARCADE</a><a href={THEME.instagramUrl} target="_blank" rel="noreferrer">CHECK US OUT ↗</a></nav><div className="identity" id="login">
          {loadingIdentity ? <span className="quiet">Checking access…</span> : player ? (
            <><button onClick={() => setProfileOpen(true)} className="profile-link">{player.handle ?? player.displayName}</button><button onClick={() => void logout()} className="text-button">Sign out</button></>
          ) : <div ref={buttonRef} aria-label="Sign in with Google" />}
        </div>
      </header>

      <section className="hero" id="top"><p className="eyebrow">ARCADE / SELECT A CABINET</p><h1>ONE MORE<br /><i>RUN.</i></h1>
        <p className="hero-copy">Three quick cabinets, one verified BITS Goa identity, and leaderboards that actually mean something.</p>
        <p className="status" role="status">{notice}</p>
      </section>

      <section className="cabinet-grid" aria-label="Games">
        {Object.values(GAMES).map((game, index) => (
          <article className={`cabinet cabinet-${index + 1}`} key={game.id}>
            <p className="cabinet-index">0{index + 1}</p>
            <h2>{game.title}</h2>
            <p>{game.shortDescription}</p>
            <p className="control-hint">{game.controlHint}</p>
            <div className="game-preview"><img src={game.previewImage} alt="" /></div><button className="play-button" onClick={() => void launchGame(game)}>Play for score</button><button className="demo-button" onClick={() => launchDemo(game)}>Try a demo</button>
            <Leaderboard entries={leaderboards[game.id] ?? []} label={game.scoreLabel} />
          </article>
        ))}
      </section>

      <section className="rules">
        <p><strong>How it works:</strong> only your best verified score per game is kept. Top 10 boards are provisional until the campaign closes.</p>
        {CAMPAIGN.registrationUrl ? <a href={CAMPAIGN.registrationUrl} target="_blank" rel="noreferrer">Open the induction form ↗</a> : null}
      </section>

      {activeGame ? (
        <div className="game-modal" role="dialog" aria-modal="true" aria-label={`${activeGame.title} game`}>
          <div className="game-modal-bar">
            <div><strong>{activeGame.title}</strong><span>{activeRun ? "Scoreable run active" : "Run complete"}</span></div>
            <button className="text-button" onClick={() => setActiveGame(null)}>Close cabinet</button>
          </div>
          <iframe
            title={activeGame.title}
            src={`${activeGame.embedPath}&run=${encodeURIComponent(activeRun?.runId ?? "preview")}&seed=${encodeURIComponent(activeRun?.seed ?? "")}`}
            className="game-frame"
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
  return <div className="profile-overlay" role="dialog" aria-modal="true" aria-label="Create your arcade profile"><div className="profile-modal avatar-studio"><section className="avatar-preview-panel"><p>PLAYER CARD / 01</p><AvatarPreview avatar={avatar} /><small>FULL-BODY TEDx FIT · TEMPLATE ART CAN BE REPLACED LATER</small></section><section className="avatar-controls"><p>PROFILE SETUP / CHOOSE YOUR CHAMPION</p><h2>BUILD YOUR<br /><em>PLAYER.</em></h2><label>PUBLIC CALLSIGN<input value={handle} maxLength={16} placeholder="e.g. stageleft" onChange={(event) => onHandle(event.target.value)} /></label><div className="champion-picker" aria-label="Champion template">{CHAMPION_TEMPLATES.map((template) => <button type="button" key={template.id} className={avatar.template === template.id ? "is-selected" : ""} onClick={() => onAvatar({ template: template.id })}><ChampionSprite champion={template} /><span>{template.name}</span></button>)}</div><section className="champion-lore"><p>{champion.name} <span>{champion.role}</span></p><blockquote>{champion.origin}</blockquote><strong>{champion.quirk}</strong><div className="champion-stats">{Object.entries(champion.stats).map(([stat, amount]) => <span key={stat}>{stat}<i>{"■".repeat(amount)}{"□".repeat(5 - amount)}</i></span>)}</div></section>{error ? <p className="profile-error">{error}</p> : null}<button className="big-button big-button--red" onClick={onSave}>LOCK IN PLAYER CARD <span>→</span></button><small>Your Google name stays private. This callsign appears on the board.</small></section></div></div>;
}

function AvatarPreview({ avatar }: { avatar: AvatarConfig }) {
  const champion = championFor(avatar);
  return <div className="champion-preview" aria-label={`${champion.name} full-body pixel avatar preview`}><ChampionSprite champion={champion} /><span className="pixel-avatar-scan" /><span className="champion-preview__tag">TEDx / {champion.name}</span></div>;
}

function ChampionSprite({ champion }: { champion: ReturnType<typeof championFor> }) {
  return <span className="champion-sprite" style={{ backgroundPosition: champion.spritePosition }} aria-hidden="true" />;
}

function Leaderboard({ entries, label }: { entries: LeaderboardEntry[]; label: string }) {
  return (
    <ol className="leaderboard" aria-label={`Top scores by ${label}`}>
      {entries.length ? entries.map((entry, index) => (
        <li key={`${entry.displayName}-${entry.achievedAt}`}><span>{index + 1}. {entry.displayName}</span><b>{entry.score}</b></li>
      )) : <li className="quiet">The board is waiting for a first score.</li>}
    </ol>
  );
}
