"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAMPAIGN } from "../config/campaign";
import { GAMES, type GameDefinition, type GameId } from "../config/games";

type Player = { email: string; displayName: string } | null;
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
    setPlayer(data.player);
    setNotice(`You’re in, ${data.player.displayName.split(" ")[0]}. Your personal bests are now linked to this account.`);
  }, []);

  useEffect(() => {
    void fetch("/api/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { player: Player }) => setPlayer(data.player))
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

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setPlayer(null);
    setActiveGame(null);
    setActiveRun(null);
    setNotice("Signed out. Your verified scores remain safely attached to your account.");
  }

  return (
    <main className="arcade-shell">
      <header className="arcade-header">
        <a className="wordmark" href="#top" aria-label="TEDxBITSGoa Arcade home">
          <span>TEDx</span>BITSGoa <em>ARCADE</em>
        </a>
        <div className="identity">
          {loadingIdentity ? <span className="quiet">Checking access…</span> : player ? (
            <><span>{player.displayName}</span><button onClick={() => void logout()} className="text-button">Sign out</button></>
          ) : <div ref={buttonRef} aria-label="Sign in with Google" />}
        </div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">THE 10-DAY RECRUITMENT SIDE QUEST</p>
        <h1>Play well. <i>Get noticed.</i></h1>
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
            <button className="play-button" onClick={() => void launchGame(game)}>Play for score</button>
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
    </main>
  );
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
