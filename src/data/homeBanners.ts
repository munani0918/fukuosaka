export type HomeBenefitBanner = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

export const homeBenefitBanners: HomeBenefitBanner[] = [
  {
    id: "stay-coupon",
    title: "일본 숙소 예약 전 쿠폰 확인하기",
    description: "오사카·후쿠오카 숙소 예약 전, 제휴 플랫폼 혜택을 먼저 확인해보세요.",
    ctaLabel: "혜택 보기",
    href: "#",
  },
  {
    id: "osaka-ticket",
    title: "오사카 인기 티켓 미리 준비하기",
    description: "유니버설·전망대·교통패스까지 여행 전 필요한 티켓을 확인해보세요.",
    ctaLabel: "티켓 보기",
    href: "#",
  },
  {
    id: "japan-esim",
    title: "일본 도착 전 eSIM 먼저 준비하세요",
    description: "공항 도착 후 바로 인터넷을 쓰고 싶다면 출국 전 미리 준비해보세요.",
    ctaLabel: "준비하기",
    href: "#",
  },
];
