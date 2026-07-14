"use client";

import type { ReactNode } from "react";
import { sendGAEvent } from "@next/third-parties/google";

type AffiliateLinkProps = {
  href: string;
  provider: "myrealtrip" | "agoda";
  placement:
    | "stay_detail_room"
    | "stay_detail_sticky"
    | "tour_detail_sticky"
    | "agoda_detail_sticky";
  itemType: "hotel" | "tour_ticket";
  productName: string;
  productId?: string;
  cityCode?: string;
  className?: string;
  children: ReactNode;
};

function destinationDomain(href: string) {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}

export function AffiliateLink({
  href,
  provider,
  placement,
  itemType,
  productName,
  productId = "",
  cityCode = "",
  className,
  children,
}: AffiliateLinkProps) {
  function handleClick() {
    sendGAEvent("event", "affiliate_click", {
      source: "detail_page",
      provider,
      placement,
      item_type: itemType,
      product_name: productName.slice(0, 100),
      product_id: productId,
      city_code: cityCode,
      destination_domain: destinationDomain(href),
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
