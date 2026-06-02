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
    eyebrow: "후쿠오사카 전용 혜택",
    title: "예약 전 쿠폰부터 챙기세요",
    description: "마이리얼트립 숙소·투어·티켓 쿠폰팩",
    note: "로그인 후 받아두면 결제 단계에서 적용할 수 있어요",
    ctaText: "쿠폰팩 보기",
    href: "/benefits/myrealtrip-coupons",
    status: "ready",
    visual: "coupon",
    isActive: true,
  },
  {
    id: "fukuosaka-guide",
    eyebrow: "처음이라도 쉽게",
    title: "예산만 넣으면 여행 준비 끝",
    description: "항공·숙소·투어·일정 뼈대를 한 번에 확인해보세요",
    ctaText: "사용법 보기",
    status: "soon",
    visual: "guide",
    isActive: true,
  },
  {
    id: "launch-sns-event",
    eyebrow: "오픈 기념",
    title: "후쿠오사카 오픈 기념 이벤트",
    description: "SNS에 공유하고 여행 준비 혜택을 받아보세요",
    ctaText: "이벤트 보기",
    status: "soon",
    visual: "event",
    isActive: true,
  },
];
