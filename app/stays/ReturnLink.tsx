"use client";

import type { MouseEvent, ReactNode } from "react";

type ReturnLinkProps = {
  href: string;
  label: string;
  className: string;
  children?: ReactNode;
  preferHref?: boolean;
  storageKey?: string;
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

export function ReturnLink({
  href,
  label,
  className,
  children,
  preferHref = false,
  storageKey,
}: ReturnLinkProps) {
  function getStoredTarget() {
    if (!storageKey) return null;
    try {
      return safeReturnTarget(window.sessionStorage.getItem(storageKey));
    } catch {
      return null;
    }
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const storedTarget = getStoredTarget();
    const hrefTarget = safeReturnTarget(href);

    if (preferHref) {
      event.preventDefault();
      const preferredTarget = hrefTarget && hrefTarget !== "/" ? hrefTarget : storedTarget;
      window.location.assign(preferredTarget || hrefTarget || "/");
      return;
    }

    if (window.history.length > 1) {
      event.preventDefault();
      window.history.back();
      return;
    }

    if (storedTarget) {
      event.preventDefault();
      window.location.assign(storedTarget);
    }
  }

  return (
    <a href={href} aria-label={label} className={className} onClick={handleClick}>
      {children ?? label}
    </a>
  );
}
