"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

import { LoginRequiredSheet } from "@/src/components/LoginRequiredSheet";
import { isLoggedIn } from "@/src/lib/auth/client";
import {
  buildSavedItemKey,
  isSavedItem,
  toggleSavedItem,
} from "@/src/lib/savedItems";
import type { SavedItem } from "@/src/types/savedTrip";

type SavedItemStarButtonProps = {
  item: SavedItem;
  className?: string;
};

const savedItemsEventName = "fukuosaka:saved-items-changed";

export function SavedItemStarButton({ item, className = "" }: SavedItemStarButtonProps) {
  const [saved, setSaved] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);
  const key = buildSavedItemKey(item);

  useEffect(() => {
    function syncSavedState() {
      setSaved(isSavedItem(item));
    }

    syncSavedState();
    window.addEventListener("storage", syncSavedState);
    window.addEventListener(savedItemsEventName, syncSavedState);
    return () => {
      window.removeEventListener("storage", syncSavedState);
      window.removeEventListener(savedItemsEventName, syncSavedState);
    };
  }, [item, key]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (checkingAuth) return;

    setCheckingAuth(true);
    const loggedIn = await isLoggedIn();
    setCheckingAuth(false);

    if (!loggedIn) {
      setLoginSheetOpen(true);
      return;
    }

    const nextSaved = toggleSavedItem(item);
    setSaved(nextSaved);
    window.dispatchEvent(new Event(savedItemsEventName));
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={checkingAuth}
        aria-pressed={saved}
        aria-label={saved ? "찜 해제" : "찜하기"}
        title={saved ? "찜 해제" : "찜하기"}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[18px] font-black leading-none shadow-[0_8px_18px_rgba(78,42,29,0.08)] transition active:scale-95 disabled:cursor-wait disabled:opacity-70 ${
          saved
            ? "border-[#f2b8af] bg-[#fff0ea] text-[#e65b50]"
            : "border-[#efd8cf] bg-white/92 text-[#c7aca2]"
        } ${className}`}
      >
        {saved ? "★" : "☆"}
      </button>
      <LoginRequiredSheet open={loginSheetOpen} onClose={() => setLoginSheetOpen(false)} />
    </>
  );
}
