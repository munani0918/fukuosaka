"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

type PolicyBackButtonProps = {
  label: string;
};

function hasSameOriginReferrer() {
  if (typeof window === "undefined") return false;
  if (!document.referrer) return false;

  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function PolicyBackButton({ label }: PolicyBackButtonProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (hasSameOriginReferrer() && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[28px] leading-none text-[#2c211d] shadow-[0_8px_18px_rgba(126,74,61,0.06)]"
      aria-label={label}
    >
      ‹
    </Link>
  );
}
