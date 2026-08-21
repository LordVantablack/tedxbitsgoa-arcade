"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarStudio } from "../ArcadeClient";
import { DEFAULT_AVATAR, type AvatarConfig } from "../../config/avatar";
import { SiteNav } from "../SiteNav";

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

  if (loading) return <main className="experience avatar-page-status"><SiteNav active="profile" /><section>LOADING PLAYER CARD…</section></main>;
  if (!player && !demoMode) return <main className="experience avatar-page"><SiteNav active="profile" /><AvatarStudio handle={handle} avatar={avatar} error="" onHandle={setHandle} onAvatar={setAvatar} onSave={() => undefined} /><section className="profile-sign-in-gate" aria-label="Sign in required"><div><p>PLAYER PROFILE LOCKED</p><strong>SIGN IN TO<br />BUILD YOUR PLAYER.</strong><span>Your callsign and avatar are linked to your BITS Goa account.</span><Link className="big-button big-button--red" href="/arcade?setup=profile">SIGN IN WITH BITS GOA <b>→</b></Link></div></section></main>;
  if (demoMode && !player) return <main className="experience avatar-page"><SiteNav active="profile" /><AvatarStudio handle={handle} avatar={avatar} error={error} onHandle={setHandle} onAvatar={setAvatar} onSave={() => setError("Preview mode only — sign in to save your player card.")} /></main>;
  return <main className="experience avatar-page"><SiteNav active="profile" /><AvatarStudio handle={handle} avatar={avatar} error={error} onHandle={setHandle} onAvatar={setAvatar} onSave={() => void save()} /></main>;
}
