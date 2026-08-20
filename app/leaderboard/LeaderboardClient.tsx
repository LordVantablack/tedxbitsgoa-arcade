"use client";

import { useEffect, useState } from "react";
import { GAMES, type GameId } from "../../config/games";
import { SiteNav } from "../SiteNav";

type Entry = { displayName: string; score: number; achievedAt: string };
type Boards = Partial<Record<GameId, Entry[]>>;

export function LeaderboardClient() {
  const [boards, setBoards] = useState<Boards>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all(Object.values(GAMES).map(async (game) => {
      const response = await fetch(`/api/leaderboards/${game.id}`, { cache: "no-store" });
      const data = response.ok ? await response.json() as { entries: Entry[] } : { entries: [] };
      return [game.id, data.entries] as const;
    })).then((loaded) => setBoards(Object.fromEntries(loaded) as Boards)).finally(() => setLoading(false));
  }, []);

  return (
    <main className="experience leaderboard-page">
      <SiteNav active="leaderboard" />
      <section className="leaderboard-hero">
        <p className="eyebrow">ARCADE / VERIFIED TOP 10</p>
        <h1>HIGH<br /><i>SCORES.</i></h1>
        <p>Every board shows verified personal bests only. Ties are ordered by the earlier completed run.</p>
      </section>
      <section className="leaderboard-page__grid" aria-label="Game leaderboards">
        {Object.values(GAMES).map((game, index) => (
          <article className="leaderboard-card" key={game.id}>
            <p>0{index + 1} / {game.scoreLabel.toUpperCase()}</p>
            <h2>{game.title}</h2>
            <ol>
              {loading ? <li className="quiet">LOADING SCORES…</li> : (boards[game.id] ?? []).length ? (boards[game.id] ?? []).map((entry, rank) => <li key={`${entry.displayName}-${entry.achievedAt}`}><span><b>{String(rank + 1).padStart(2, "0")}</b>{entry.displayName}</span><strong>{entry.score}</strong></li>) : <li className="quiet">WAITING FOR A FIRST SCORE.</li>}
            </ol>
          </article>
        ))}
      </section>
    </main>
  );
}
