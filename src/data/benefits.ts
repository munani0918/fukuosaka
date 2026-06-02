export type HomeBenefitBanner = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
  ctaText: string;
  href?: string;
  status: "ready" | "soon";
  visual: "coupon" | "guide" | "event";
  isActive: boolean;
};

export const myrealtripCouponLinks = {
  tourTicket: "https://myrealt.rip/ajWV8f",
  overseasStay: "https://myrealt.rip/ajWg22",
} as const;

export const homeBenefitBanners: HomeBenefitBanner[] = [
  {
    id: "myrealtrip-coupon-pack",
    eyebrow: "여행 준비 혜택",
    title: "예약 전 쿠폰부터 챙기세요",
    description: "마이리얼트립 숙소·투어·티켓 쿠폰팩",
    ctaText: "쿠폰팩 보기",
    href: "/benefits/myrealtrip-coupons",
    status: "ready",
    visual: "coupon",
    isActive: true,
  },
];
