"use client";

import Link from "next/link";
import { KeyboardEvent, useRef, useState } from "react";
import { CAMPAIGN } from "../config/campaign";
import { THEME } from "../config/theme";

export function LandingClient() {
  const [activeControl, setActiveControl] = useState(1);
  const controlRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  function moveControlFocus(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const lastIndex = controlRefs.current.length - 1;
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;
    if (nextIndex !== null) {
      event.preventDefault();
      setActiveControl(nextIndex);
      controlRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <main className="experience landing-experience">
      <div className="ambient" aria-hidden="true">
        {THEME.backgroundVideoSrc ? <video autoPlay muted loop playsInline poster="/og-arcade.png"><source src={THEME.backgroundVideoSrc} /></video> : null}
      </div>
      <header className="landing-brand-header">
        <Link href="/" className="landing-brand-box" aria-label="TEDxBITSGoa Arcade home">
          <img className="landing-brand-ribbon-image" src="/media/tedxbitsgoa-hero-ribbon.png" alt="" />
        </Link>
      </header>
      <section className="landing-hero landing-hero--arcade">
        <div className="hero-grid">
          <div className="hero-console">
            <Link href="/avatar" className="profile-poster" aria-label="Create your TEDxBITSGoa player profile">
              <span aria-hidden="true">?</span>
            </Link>
            <p className="landing-copy">The TEDxBITSGoa universe is loading. Choose your next move, meet the team, and enter the arcade. <small>AVATAR</small></p>
          </div>
          <div className="hero-actions-panel">
            <p className="control-hint">USE ↑ ↓ TO SELECT // ENTER TO OPEN</p>
            <nav className="control-wall" aria-label="Arcade controls">
              <a ref={(element) => { controlRefs.current[0] = element; }} onFocus={() => setActiveControl(0)} onMouseEnter={() => setActiveControl(0)} onKeyDown={(event) => moveControlFocus(event, 0)} className={`control-tile ${activeControl === 0 ? "is-selected" : ""}`} href={THEME.instagramUrl} target="_blank" rel="noreferrer"><i aria-hidden="true">▶</i><b>INSTAGRAM</b></a>
              <Link ref={(element) => { controlRefs.current[1] = element; }} onFocus={() => setActiveControl(1)} onMouseEnter={() => setActiveControl(1)} onKeyDown={(event) => moveControlFocus(event, 1)} className={`control-tile ${activeControl === 1 ? "is-selected" : ""}`} href="/arcade"><i aria-hidden="true">▶</i><b>ENTER ARCADE</b></Link>
              <Link ref={(element) => { controlRefs.current[2] = element; }} onFocus={() => setActiveControl(2)} onMouseEnter={() => setActiveControl(2)} onKeyDown={(event) => moveControlFocus(event, 2)} className={`control-tile ${activeControl === 2 ? "is-selected" : ""}`} href="/arcade#login"><i aria-hidden="true">▶</i><b>SIGN IN</b></Link>
              <Link ref={(element) => { controlRefs.current[3] = element; }} onFocus={() => setActiveControl(3)} onMouseEnter={() => setActiveControl(3)} onKeyDown={(event) => moveControlFocus(event, 3)} className={`control-tile ${activeControl === 3 ? "is-selected" : ""}`} href="/leaderboard"><i aria-hidden="true">▶</i><b>LEADERBOARD</b></Link>
              <Link ref={(element) => { controlRefs.current[4] = element; }} onFocus={() => setActiveControl(4)} onMouseEnter={() => setActiveControl(4)} onKeyDown={(event) => moveControlFocus(event, 4)} className={`control-tile ${activeControl === 4 ? "is-selected" : ""}`} href="/avatar"><i aria-hidden="true">▶</i><b>PROFILE STUDIO</b></Link>
              <a ref={(element) => { controlRefs.current[5] = element; }} onFocus={() => setActiveControl(5)} onMouseEnter={() => setActiveControl(5)} onKeyDown={(event) => moveControlFocus(event, 5)} className={`control-tile ${activeControl === 5 ? "is-selected" : ""}`} href={CAMPAIGN.registrationUrl || "#apply"} target={CAMPAIGN.registrationUrl ? "_blank" : undefined} rel="noreferrer"><i aria-hidden="true">▶</i><b>APPLY TO TEDx</b></a>
            </nav>
          </div>
          <aside className="hero-media" aria-label="TEDxBITSGoa campaign media">
            <figure className="campaign-poster">
              <img src={THEME.heroPosterSrc} alt="TEDxBITSGoa Coming Soon campaign poster" />
            </figure>
            <div className="orientation-video" id="orientation-video">
              {THEME.orientationVideoEmbedUrl ? (
                <iframe src={THEME.orientationVideoEmbedUrl} title="TEDxBITSGoa orientation video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              ) : (
                <a href={THEME.orientationVideoUrl || "#orientation-video"} target={THEME.orientationVideoUrl ? "_blank" : undefined} rel="noreferrer" className="orientation-video__placeholder" aria-label="Orientation video placeholder">
                  <span className="orientation-video__play">▶</span><span><b>ORIENTATION FILM</b><small>VIDEO UPLOAD INCOMING</small></span><i>↗</i>
                </a>
              )}
            </div>
          </aside>
        </div>
        <p id="apply" className="landing-note">Application link is being plugged in.</p>
      </section>
      <footer className="landing-footer"><span>PLAY WELL. GET NOTICED.</span><a href={THEME.instagramUrl} target="_blank" rel="noreferrer">@TEDXBITSGoa</a></footer>
    </main>
  );
}
