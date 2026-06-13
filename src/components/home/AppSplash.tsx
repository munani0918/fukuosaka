"use client";

import { useEffect, useState } from "react";

const SPLASH_STORAGE_KEY = "fukuosaka_splash_seen";

type SplashPhase = "showing" | "leaving" | "hidden";

function isStandaloneAppMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    document.referrer.startsWith("android-app://")
  );
}

function hasSeenSplash() {
  if (typeof window === "undefined") return false;

  try {
    return (
      isStandaloneAppMode() ||
      window.sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1"
    );
  } catch {
    return isStandaloneAppMode();
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
          __html: `try{if(matchMedia("(display-mode: standalone)").matches||matchMedia("(display-mode: fullscreen)").matches||document.referrer.indexOf("android-app://")===0||sessionStorage.getItem("${SPLASH_STORAGE_KEY}")==="1"){document.documentElement.dataset.fukuosakaSplashSeen="1"}}catch(e){}`,
        }}
      />
      <div
        className={`fukuosaka-splash fixed inset-0 z-[9999] items-center justify-center overflow-hidden bg-[#fff7f1] ${
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(255,207,190,0.54)_0%,rgba(255,236,226,0.42)_30%,rgba(255,247,241,0)_66%)]" />
        <div className="absolute left-1/2 top-1/2 h-28 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f6b7a8]/20 blur-3xl" />

        <div className="relative animate-[fukuosakaSplashLogoFloat_1900ms_ease-in-out_620ms_infinite]">
          <div className="absolute inset-x-1 top-1/2 h-4 -translate-y-1/2 rounded-full bg-[#efb6a6]/35 blur-xl" />
          <span className="relative block animate-[fukuosakaSplashLogoIn_620ms_cubic-bezier(0.22,1,0.36,1)_forwards,fukuosakaSplashLogoSheen_2200ms_ease-in-out_620ms_infinite] bg-[linear-gradient(105deg,#7a4a3f_0%,#f35f5b_28%,#df806a_50%,#9b5e4f_72%,#f35f5b_100%)] bg-[length:220%_100%] bg-clip-text text-[30px] font-black uppercase tracking-[0.095em] text-transparent opacity-0 drop-shadow-[0_12px_24px_rgba(188,88,70,0.16)]">
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
              filter: blur(4px);
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              filter: blur(0);
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

          @keyframes fukuosakaSplashLogoSheen {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
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
