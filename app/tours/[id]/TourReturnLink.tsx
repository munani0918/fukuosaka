"use client";

import type { MouseEvent, ReactNode } from "react";

type TourReturnLinkProps = {
  href: string;
  label: string;
  className: string;
  children?: ReactNode;
  returnTo?: string | null;
};

function safeReturnTarget(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function TourReturnLink({
  href,
  label,
  className,
  children,
  returnTo,
}: TourReturnLinkProps) {
  function getStoredTarget() {
    try {
      return safeReturnTarget(window.sessionStorage.getItem("fukuosaka_last_result_url"));
    } catch {
      return null;
    }
  }

  function canUseHistoryBack() {
    const safeReturnTo = safeReturnTarget(returnTo);
    const storedTarget = getStoredTarget();
    const hasResultTarget = Boolean(
      safeReturnTo?.includes("planner-result.html") ||
        storedTarget?.includes("planner-result.html"),
    );

    if (!hasResultTarget || window.history.length <= 1) return false;

    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      return Boolean(
        referrer &&
          referrer.origin === window.location.origin &&
          referrer.pathname.endsWith("/planner-result.html"),
      );
    } catch {
      return false;
    }
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const hrefTarget = safeReturnTarget(href);
    const storedTarget = getStoredTarget();
    const returnTarget = safeReturnTarget(returnTo);

    event.preventDefault();

    if (canUseHistoryBack()) {
      window.history.back();
      return;
    }

    if (returnTarget) {
      window.location.assign(returnTarget || storedTarget || hrefTarget || "/tours");
      return;
    }

    window.location.assign(hrefTarget || "/tours");
  }

  return (
    <a href={href} aria-label={label} className={className} onClick={handleClick}>
      {children ?? label}
    </a>
  );
}
