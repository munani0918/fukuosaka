"use client";

import type { MouseEvent, ReactNode } from "react";

type AgodaBridgeBackLinkProps = {
  href: string;
  label: string;
  className: string;
  children?: ReactNode;
};

export function AgodaBridgeBackLink({
  href,
  label,
  className,
  children,
}: AgodaBridgeBackLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  }

  return (
    <a href={href} aria-label={label} className={className} onClick={handleClick}>
      {children ?? label}
    </a>
  );
}
