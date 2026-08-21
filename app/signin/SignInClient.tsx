"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CAMPAIGN } from "../../config/campaign";
import { SiteNav } from "../SiteNav";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (response: { credential: string }) => void; hosted_domain?: string }): void;
          renderButton(parent: HTMLElement, options: { theme: "outline"; size: "large"; text: "signin_with"; shape: "rectangular"; width: number }): void;
        };
      };
    };
  }
}

export function SignInClient() {
  const router = useRouter();
  const googleButton = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Checking your sign-in status…");

  useEffect(() => {
    let disposed = false;
    let script: HTMLScriptElement | null = null;

    async function finishSignIn(credential: string) {
      setStatus("Verifying your BITS Goa account…");
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ credential }),
      });
      const data = (await response.json()) as { player?: unknown; error?: string };
      if (!response.ok || !data.player) {
        setStatus(data.error ?? "We could not sign you in. Try your BITS Goa account again.");
        return;
      }
      router.replace("/avatar");
    }

    async function initializeGoogle() {
      const response = await fetch("/api/auth/config", { cache: "no-store" });
      const { googleClientId } = (await response.json()) as { googleClientId: string | null };
      if (disposed) return;
      if (!googleClientId || !window.google || !googleButton.current) {
        setStatus("Google sign-in is not configured yet.");
        return;
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        hosted_domain: CAMPAIGN.allowedGoogleWorkspaceDomain,
        callback: ({ credential }) => void finishSignIn(credential),
      });
      googleButton.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 280,
      });
      setStatus("Use your BITS Goa Google account to continue.");
    }

    void fetch("/api/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { player: unknown }) => {
        if (disposed) return;
        if (data.player) {
          router.replace("/avatar");
          return;
        }
        if (window.google) {
          void initializeGoogle();
          return;
        }
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => void initializeGoogle();
        script.onerror = () => setStatus("Google sign-in could not load. Refresh and try again.");
        document.head.appendChild(script);
      })
      .catch(() => setStatus("Could not check your sign-in status. Refresh and try again."));

    return () => {
      disposed = true;
      script?.remove();
    };
  }, [router]);

  return (
    <main className="experience signin-page">
      <SiteNav />
      <section className="signin-card" aria-labelledby="signin-title">
        <p>PLAYER ACCESS / BITS GOA</p>
        <h1 id="signin-title">SIGN IN.<br /><i>BUILD YOUR PLAYER.</i></h1>
        <span>After verification, you’ll create a username and choose the avatar shown on your home placard.</span>
        <div ref={googleButton} className="google-signin-button" aria-label="Google sign-in button" />
        <small role="status">{status}</small>
        <em>Any BITS Goa account can play. Only f2026XXXX@goa.bits-pilani.ac.in usernames appear on the leaderboard.</em>
      </section>
    </main>
  );
}
