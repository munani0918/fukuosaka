export type BudgetTemplate = {
  slug: string;
  city: "osaka" | "fukuoka";
  title: string;
  budgetLabel: string;
  shortDescription: string;
  duration: string;
  tags: string[];
  budgetPreset: "budget" | "standard" | "premium";
  defaultBudgetPerPerson: number;
  packageType: "flight_hotel_tour" | "flight_hotel";
  nearbyMode: "light" | "standard" | "comfort";
  budgetBreakdown: { label: string; amount: string }[];
  itinerarySummary: string[];
};

export const budgetTemplates: BudgetTemplate[] = [
  {
    slug: "osaka-budget-3n4d",
    city: "osaka",
    title: "오사카 가성비 3박4일",
    budgetLabel: "1인 50~70만 원",
    shortDescription: "항공+숙소 중심 실속 플랜",
    duration: "3박4일",
    tags: ["가성비", "항공+숙소", "시내 중심"],
    budgetPreset: "budget",
    defaultBudgetPerPerson: 600000,
    packageType: "flight_hotel",
    nearbyMode: "light",
    budgetBreakdown: [
      { label: "항공권", amount: "25~32만 원" },
      { label: "숙소", amount: "22~30만 원" },
      { label: "선택 티켓", amount: "3~8만 원" },
    ],
    itinerarySummary: [
      "1일차: 난바·도톤보리 주변에서 가볍게 시작",
      "2일차: 오사카성 또는 우메다 대표 동선",
      "3일차: 신사이바시·구로몬시장 실속 코스",
      "4일차: 숙소 주변 정리 후 공항 이동",
    ],
  },
  {
    slug: "osaka-standard-3n4d",
    city: "osaka",
    title: "오사카 표준 3박4일",
    budgetLabel: "1인 80~120만 원",
    shortDescription: "처음 가는 여행자에게 무난한 구성",
    duration: "3박4일",
    tags: ["표준", "대표 명소", "투어 선택"],
    budgetPreset: "standard",
    defaultBudgetPerPerson: 1000000,
    packageType: "flight_hotel_tour",
    nearbyMode: "standard",
    budgetBreakdown: [
      { label: "항공권", amount: "28~38만 원" },
      { label: "숙소", amount: "36~55만 원" },
      { label: "투어·티켓", amount: "8~18만 원" },
    ],
    itinerarySummary: [
      "1일차: 난바 체크인과 도톤보리 야경",
      "2일차: 오사카성·우메다 전망 동선",
      "3일차: 교토·나라·고베 중 근교 하루",
      "4일차: 마지막 쇼핑 후 공항 이동",
    ],
  },
  {
    slug: "fukuoka-onsen-3n4d",
    city: "fukuoka",
    title: "후쿠오카 온천 3박4일",
    budgetLabel: "1인 80~120만 원",
    shortDescription: "도심과 근교 온천을 함께",
    duration: "3박4일",
    tags: ["온천", "근교", "여유 일정"],
    budgetPreset: "standard",
    defaultBudgetPerPerson: 1000000,
    packageType: "flight_hotel_tour",
    nearbyMode: "standard",
    budgetBreakdown: [
      { label: "항공권", amount: "25~35만 원" },
      { label: "숙소", amount: "35~55만 원" },
      { label: "온천·근교", amount: "10~20만 원" },
    ],
    itinerarySummary: [
      "1일차: 하카타 체크인과 나카스 야타이",
      "2일차: 다자이후 반나절과 텐진 산책",
      "3일차: 유후인·벳푸 온천형 근교 코스",
      "4일차: 하카타역 기념품 정리 후 공항 이동",
    ],
  },
];

export function findBudgetTemplate(slug: string) {
  return budgetTemplates.find((template) => template.slug === slug);
}
