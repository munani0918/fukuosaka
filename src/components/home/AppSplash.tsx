"use client";

import { useEffect, useState } from "react";

const SPLASH_STORAGE_KEY = "fukuosaka_splash_seen";

type SplashPhase = "showing" | "leaving" | "hidden";

function hasSeenSplash() {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppSplash() {
  const [phase, setPhase] = useState<SplashPhase>(() =>
    hasSeenSplash() ? "hidden" : "showing",
  );

  useEffect(() => {
    if (hasSeenSplash()) {
      document.documentElement.dataset.fukuosakaSplashSeen = "1";
      return;
    }

    try {
      window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures; the splash should still disappear normally.
    }

    const leaveTimer = window.setTimeout(() => {
      setPhase("leaving");
    }, 1100);
    const hideTimer = window.setTimeout(() => {
      document.documentElement.dataset.fukuosakaSplashSeen = "1";
      setPhase("hidden");
    }, 1450);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${SPLASH_STORAGE_KEY}")==="1"){document.documentElement.dataset.fukuosakaSplashSeen="1"}}catch(e){}`,
        }}
      />
      <div
        className={`fukuosaka-splash fixed inset-0 z-[9999] items-center justify-center bg-[#fff7f1] ${
          phase === "hidden" ? "hidden" : "flex"
        }`}
        style={{
          animation:
            phase === "leaving"
              ? "fukuosakaSplashOut 360ms ease forwards"
              : undefined,
        }}
        aria-label="FUKUOSAKA"
        aria-hidden={phase === "hidden" ? true : undefined}
        role={phase === "hidden" ? undefined : "status"}
        suppressHydrationWarning
      >
        <div className="relative animate-[fukuosakaSplashLogoFloat_1800ms_ease-in-out_520ms_infinite]">
          <div className="absolute inset-x-2 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#f3c8bb]/55 blur-xl" />
          <span className="relative block animate-[fukuosakaSplashLogoIn_560ms_cubic-bezier(0.22,1,0.36,1)_forwards] bg-[linear-gradient(120deg,#6f3a31_0%,#c15a4d_54%,#e39478_100%)] bg-clip-text text-[28px] font-semibold uppercase tracking-[0.18em] text-transparent opacity-0 drop-shadow-[0_10px_22px_rgba(166,91,72,0.13)]">
            FUKUOSAKA
          </span>
        </div>
        <style>{`
          html[data-fukuosaka-splash-seen="1"] .fukuosaka-splash {
            display: none;
          }

          @keyframes fukuosakaSplashLogoIn {
            from {
              opacity: 0;
              transform: scale(0.96);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fukuosakaSplashLogoFloat {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-2px);
            }
          }

          @keyframes fukuosakaSplashOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </>
  );
}
