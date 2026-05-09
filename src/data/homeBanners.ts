export type HomeBenefitBanner = {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  type: "stay" | "ticket" | "connectivity";
  platform: "partner" | "myrealtrip" | "esim";
  isActive: boolean;
  startDate?: string;
  endDate?: string;
};

export const homeBenefitBanners: HomeBenefitBanner[] = [
  {
    id: "stay-coupon",
    title: "숙소 예약 전 쿠폰 확인하기",
    description: "제휴 플랫폼 단독 혜택을 놓치지 마세요.",
    ctaText: "혜택 보기",
    href: "#",
    type: "stay",
    platform: "partner",
    isActive: true,
  },
  {
    id: "osaka-ticket",
    title: "오사카 필수 티켓 미리 준비하기",
    description: "유니버설·전망대·교통패스까지 미리 확인해보세요.",
    ctaText: "티켓 보기",
    href: "#",
    type: "ticket",
    platform: "myrealtrip",
    isActive: true,
  },
  {
    id: "japan-esim",
    title: "일본 도착 전 eSIM 먼저 준비하세요",
    description: "공항 도착 후 바로 인터넷을 쓰고 싶다면 미리 준비해보세요.",
    ctaText: "준비하기",
    href: "#",
    type: "connectivity",
    platform: "esim",
    isActive: true,
  },
];
