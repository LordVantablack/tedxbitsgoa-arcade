"use client";

import { useEffect, useState } from "react";
import { GAMES, type GameId } from "../../config/games";
import { SiteNav } from "../SiteNav";

type Entry = { displayName: string; score: number; achievedAt: string };
type ViewerScore = { score: number; rank: number | null; leaderboardEligible: boolean } | null;
type Board = { entries: Entry[]; viewer: ViewerScore };
type Boards = Partial<Record<GameId, Board>>;

export function LeaderboardClient() {
  const [boards, setBoards] = useState<Boards>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all(Object.values(GAMES).map(async (game) => {
      const response = await fetch(`/api/leaderboards/${game.id}`, { cache: "no-store" });
      const data = response.ok ? await response.json() as Board : { entries: [], viewer: null };
      return [game.id, data] as const;
    })).then((loaded) => setBoards(Object.fromEntries(loaded) as Boards)).finally(() => setLoading(false));
  }, []);

  return (
    <main className="experience leaderboard-page">
      <SiteNav active="leaderboard" />
      <section className="leaderboard-hero">
        <p className="eyebrow">ARCADE / VERIFIED TOP 10</p>
        <h1>HIGH<br /><i>SCORES.</i></h1>
        <p>Every board shows verified personal bests from eligible 2026-batch accounts. Any BITS Goa player can play, but only each eligible player’s chosen username is public here; ties go to the earlier completed run.</p>
      </section>
      <section className="leaderboard-page__grid" aria-label="Game leaderboards">
        {Object.values(GAMES).map((game, index) => (
          <article className="leaderboard-card" key={game.id}>
            <p>0{index + 1} / {game.scoreLabel.toUpperCase()}</p>
            <h2>{game.title}</h2>
            <ol>
              {loading ? <li className="quiet">LOADING SCORES…</li> : (boards[game.id]?.entries ?? []).length ? (boards[game.id]?.entries ?? []).map((entry, rank) => <li key={`${entry.displayName}-${entry.achievedAt}`}><span><b>{String(rank + 1).padStart(2, "0")}</b>{entry.displayName}</span><strong>{entry.score}</strong></li>) : <li className="quiet">WAITING FOR A FIRST SCORE.</li>}
            </ol>
            {boards[game.id]?.viewer ? <p className="leaderboard-card__viewer"><span>{boards[game.id]?.viewer?.rank ? `YOUR VERIFIED PB · #${boards[game.id]?.viewer?.rank}` : "YOUR PRIVATE PB"}</span><strong>{boards[game.id]?.viewer?.score}</strong></p> : <p className="leaderboard-card__viewer quiet">SIGN IN TO SEE YOUR VERIFIED PB.</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
