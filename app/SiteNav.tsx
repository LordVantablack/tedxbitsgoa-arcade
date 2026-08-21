import Link from "next/link";
import type { ReactNode } from "react";
import { THEME } from "../config/theme";

type SiteNavProps = {
  active?: "home" | "arcade" | "leaderboard" | "profile";
  slot?: ReactNode;
};

export function SiteNav({ active, slot }: SiteNavProps) {
  return (
    <header className="site-nav">
      <Link href="/" className="brand" aria-label="TEDxBITSGoa Arcade home"><b>TEDx</b>BITSGoa <i>ARCADE</i></Link>
      <nav aria-label="Primary navigation">
        <Link href="/" aria-current={active === "home" ? "page" : undefined}>HOME</Link>
        <Link href="/arcade" aria-current={active === "arcade" ? "page" : undefined}>ARCADE</Link>
        <Link href="/leaderboard" aria-current={active === "leaderboard" ? "page" : undefined}>LEADERBOARD</Link>
        <Link href="/signin?returnTo=/avatar" aria-current={active === "profile" ? "page" : undefined}>PROFILE</Link>
        <a href={THEME.instagramUrl} target="_blank" rel="noreferrer">CHECK US OUT ↗</a>
      </nav>
      {slot ?? <Link className="nav-login" href="/signin?returnTo=/avatar">LOGIN</Link>}
    </header>
  );
}
