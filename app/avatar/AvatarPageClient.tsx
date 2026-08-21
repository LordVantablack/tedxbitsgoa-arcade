"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AvatarStudio } from "../ArcadeClient";
import { DEFAULT_AVATAR, type AvatarConfig } from "../../config/avatar";
import { SiteNav } from "../SiteNav";

type Player = { email: string; displayName: string; handle: string | null; avatar: AvatarConfig } | null;

export function AvatarPageClient() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player>(null);
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { void fetch("/api/me", { cache: "no-store" }).then((response) => response.json()).then((data: { player: Player }) => { if (!data.player) { router.replace("/signin?returnTo=/avatar"); return; } setPlayer(data.player); setHandle(data.player.handle ?? ""); setAvatar(data.player.avatar); if (!data.player.handle) setError("Choose a public username before starting a game."); }).finally(() => setLoading(false)); }, [router]);

  async function save() {
    if (!handle.trim()) {
      setError("Please type a public username before locking your player card.");
      return;
    }
    const response = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ handle, avatar }) });
    const data = (await response.json()) as { player?: Player; error?: string };
    if (!response.ok || !data.player) return setError(data.error ?? "Could not save your player card.");
    setPlayer(data.player); setError(""); router.push("/arcade");
  }

  if (loading) return <main className="experience avatar-page-status"><SiteNav active="profile" /><section>LOADING PLAYER CARD…</section></main>;
  if (!player) return <main className="experience avatar-page-status"><SiteNav active="profile" /><section>REDIRECTING TO SIGN IN…</section></main>;
  return <main className="experience avatar-page"><SiteNav active="profile" /><AvatarStudio handle={handle} avatar={avatar} error={error} onHandle={setHandle} onAvatar={setAvatar} onSave={() => void save()} /></main>;
}
