"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarStudio } from "../ArcadeClient";
import { DEFAULT_AVATAR, type AvatarConfig } from "../../config/avatar";
import { THEME } from "../../config/theme";

type Player = { email: string; displayName: string; handle: string | null; avatar: AvatarConfig } | null;

export function AvatarPageClient() {
  const [player, setPlayer] = useState<Player>(null);
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const demoMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");

  useEffect(() => { void fetch("/api/me", { cache: "no-store" }).then((response) => response.json()).then((data: { player: Player }) => { setPlayer(data.player); if (data.player) { setHandle(data.player.handle ?? ""); setAvatar(data.player.avatar); } }).finally(() => setLoading(false)); }, []);

  async function save() {
    const response = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ handle, avatar }) });
    const data = (await response.json()) as { player?: Player; error?: string };
    if (!response.ok || !data.player) return setError(data.error ?? "Could not save your player card.");
    setPlayer(data.player); setError("");
  }

  if (loading) return <main className="experience avatar-page-status">LOADING PLAYER CARD…</main>;
  if (!player && !demoMode) return <main className="experience avatar-page-status"><div className="ambient" aria-hidden="true">{THEME.backgroundVideoSrc ? <video autoPlay muted loop playsInline><source src={THEME.backgroundVideoSrc} /></video> : null}</div><p>YOUR PLAYER CARD IS LINKED TO YOUR BITS GOA ACCOUNT.</p><Link className="big-button big-button--red" href="/arcade#login">LOGIN TO CONTINUE <span>→</span></Link></main>;
  if (demoMode && !player) return <main className="experience"><AvatarStudio handle={handle} avatar={avatar} error={error} onHandle={setHandle} onAvatar={setAvatar} onSave={() => setError("Preview mode only — sign in to save your player card.")} /><Link className="avatar-back" href="/arcade">← BACK TO ARCADE</Link></main>;
  return <main className="experience"><AvatarStudio handle={handle} avatar={avatar} error={error} onHandle={setHandle} onAvatar={setAvatar} onSave={() => void save()} /><Link className="avatar-back" href="/arcade">← BACK TO ARCADE</Link></main>;
}
