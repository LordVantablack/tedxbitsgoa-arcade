"use client";

import Link from "next/link";
import { KeyboardEvent, useRef, useState } from "react";
import { CAMPAIGN } from "../config/campaign";
import { THEME } from "../config/theme";

export function LandingClient() {
  const [bgm, setBgm] = useState(38);
  const [sfx, setSfx] = useState(72);
  const [soundOn, setSoundOn] = useState(true);
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
      <header className="site-nav">
        <Link href="/" className="brand"><b>TEDx</b>BITSGoa <i>ARCADE</i></Link>
        <nav><Link href="/arcade">ARCADE</Link><a href={THEME.instagramUrl} target="_blank" rel="noreferrer">CHECK US OUT ↗</a></nav>
        <Link className="nav-login" href="/arcade#login">LOGIN</Link>
      </header>
      <section className="landing-hero landing-hero--arcade">
        <div className="hero-grid">
          <div className="hero-console">
            <p className="landing-kicker">TEDxBITSGoa / ARCADE MODE</p>
            <h1 className="pixel-title">IDEAS<br /><em>IN PLAY.</em></h1>
            <p className="landing-copy">The TEDxBITSGoa universe is loading. Choose your next move, meet the team, and enter the arcade.</p>
            <p className="control-hint">USE ↑ ↓ TO SELECT // ENTER TO OPEN</p>
            <nav className="control-wall" aria-label="Arcade controls">
              <a ref={(element) => { controlRefs.current[0] = element; }} onFocus={() => setActiveControl(0)} onMouseEnter={() => setActiveControl(0)} onKeyDown={(event) => moveControlFocus(event, 0)} className={`control-tile ${activeControl === 0 ? "is-selected" : ""}`} href={THEME.instagramUrl} target="_blank" rel="noreferrer"><i aria-hidden="true">▶</i><b>INSTAGRAM</b></a>
              <Link ref={(element) => { controlRefs.current[1] = element; }} onFocus={() => setActiveControl(1)} onMouseEnter={() => setActiveControl(1)} onKeyDown={(event) => moveControlFocus(event, 1)} className={`control-tile ${activeControl === 1 ? "is-selected" : ""}`} href="/arcade"><i aria-hidden="true">▶</i><b>ENTER ARCADE</b></Link>
              <Link ref={(element) => { controlRefs.current[2] = element; }} onFocus={() => setActiveControl(2)} onMouseEnter={() => setActiveControl(2)} onKeyDown={(event) => moveControlFocus(event, 2)} className={`control-tile ${activeControl === 2 ? "is-selected" : ""}`} href="/arcade#login"><i aria-hidden="true">▶</i><b>SIGN IN</b></Link>
              <Link ref={(element) => { controlRefs.current[3] = element; }} onFocus={() => setActiveControl(3)} onMouseEnter={() => setActiveControl(3)} onKeyDown={(event) => moveControlFocus(event, 3)} className={`control-tile ${activeControl === 3 ? "is-selected" : ""}`} href="/avatar"><i aria-hidden="true">▶</i><b>PROFILE STUDIO</b></Link>
              <a ref={(element) => { controlRefs.current[4] = element; }} onFocus={() => setActiveControl(4)} onMouseEnter={() => setActiveControl(4)} onKeyDown={(event) => moveControlFocus(event, 4)} className={`control-tile ${activeControl === 4 ? "is-selected" : ""}`} href={CAMPAIGN.registrationUrl || "#apply"} target={CAMPAIGN.registrationUrl ? "_blank" : undefined} rel="noreferrer"><i aria-hidden="true">▶</i><b>APPLY TO TEDx</b></a>
            </nav>
            <div className="audio-deck" aria-label="Music controls">
              <div className="audio-deck__head"><span>AUDIO DECK</span><button type="button" aria-pressed={soundOn} onClick={() => setSoundOn((value) => !value)}>{soundOn ? "SOUND ON" : "SOUND OFF"}</button></div>
              <label><span>BGM</span><input type="range" min="0" max="100" value={soundOn ? bgm : 0} onChange={(event) => setBgm(Number(event.target.value))} aria-label="Background music volume" /></label>
              <label><span>SFX</span><input type="range" min="0" max="100" value={soundOn ? sfx : 0} onChange={(event) => setSfx(Number(event.target.value))} aria-label="Sound effects volume" /></label>
            </div>
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
