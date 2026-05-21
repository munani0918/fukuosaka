"use client";

import { useEffect, useState } from "react";

export function AppSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, 1100);
    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 1450);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fff7f1]"
      style={{
        animation: isLeaving
          ? "fukuosakaSplashOut 360ms ease forwards"
          : "fukuosakaSplashIn 420ms ease-out forwards",
      }}
      aria-label="FUKUOSAKA"
      role="status"
    >
      <div className="relative">
        <div className="absolute inset-x-2 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#f3c8bb]/55 blur-xl" />
        <span className="relative block bg-[linear-gradient(120deg,#6f3a31_0%,#c15a4d_54%,#e39478_100%)] bg-clip-text text-[28px] font-semibold uppercase tracking-[0.18em] text-transparent drop-shadow-[0_10px_22px_rgba(166,91,72,0.13)]">
          FUKUOSAKA
        </span>
      </div>
      <style>{`
        @keyframes fukuosakaSplashIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
  );
}
