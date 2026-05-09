export type BudgetTemplate = {
  slug: string;
  city: "osaka" | "fukuoka";
  cityCode: "KIX" | "FUK";
  title: string;
  miniTitle: string;
  budgetLabel: string;
  miniBudgetLabel: string;
  shortDescription: string;
  miniDescription: string;
  duration: string;
  nights: number;
  tags: string[];
  icon: "wallet" | "sparkles" | "coins" | "onsen";
  budgetPreset: "budget" | "standard" | "premium";
  defaultBudgetPerPerson: number;
  packageType: "flight_hotel_tour" | "flight_hotel";
  nearbyMode: "light" | "standard" | "comfort";
  styles: string[];
  note?: string;
  planType: "cityBudget" | "standard" | "onsen";
  routeStyle: string;
  nearbyTrip: "false" | "optional" | "lightOptional" | "true";
  recommendedExtras: "ticketPassOnly" | "ticketPassAndOptionalTour" | "onsenTourAndPass";
  budgetBreakdown: { label: string; amount: string }[];
  itinerarySummary: string[];
};

export const budgetTemplates: BudgetTemplate[] = [
  {
    slug: "osaka-budget-2n3d",
    city: "osaka",
    cityCode: "KIX",
    title: "오사카 가성비 2박3일",
    miniTitle: "오사카 가성비",
    budgetLabel: "1인 50~70만 원 기준",
    miniBudgetLabel: "2박3일 · 50~70만",
    shortDescription: "오사카 시내 핵심 동선을 실속 있게 보는 항공+숙소 중심 샘플 플랜이에요.",
    miniDescription: "시내 실속형",
    duration: "2박3일",
    nights: 2,
    tags: ["가성비", "항공+숙소", "시내 중심"],
    icon: "wallet",
    budgetPreset: "budget",
    defaultBudgetPerPerson: 600000,
    packageType: "flight_hotel",
    nearbyMode: "light",
    styles: ["sightseeing", "food"],
    planType: "cityBudget",
    routeStyle: "시내 실속형",
    nearbyTrip: "false",
    recommendedExtras: "ticketPassOnly",
    budgetBreakdown: [
      { label: "항공권", amount: "25~32만 원" },
      { label: "숙소", amount: "20~30만 원" },
      { label: "선택 티켓", amount: "3~8만 원" },
    ],
    itinerarySummary: [
      "1일차: 난바·도톤보리 주변에서 가볍게 시작",
      "2일차: 오사카성 또는 우메다 대표 동선",
      "3일차: 구로몬시장·신사이바시 짧은 마무리",
    ],
  },
  {
    slug: "osaka-standard-3n4d",
    city: "osaka",
    cityCode: "KIX",
    title: "오사카 표준 3박4일",
    miniTitle: "오사카 표준",
    budgetLabel: "1인 80~120만 원 기준",
    miniBudgetLabel: "3박4일 · 80~120만",
    shortDescription: "처음 가는 여행자에게 무난한 대표 코스형 샘플 플랜이에요.",
    miniDescription: "대표 코스형",
    duration: "3박4일",
    nights: 3,
    tags: ["표준", "대표 코스형", "처음 여행"],
    icon: "sparkles",
    budgetPreset: "standard",
    defaultBudgetPerPerson: 1000000,
    packageType: "flight_hotel_tour",
    nearbyMode: "standard",
    styles: ["sightseeing", "shopping"],
    note: "USJ·교토/나라 선택 가능",
    planType: "standard",
    routeStyle: "대표 코스형",
    nearbyTrip: "optional",
    recommendedExtras: "ticketPassAndOptionalTour",
    budgetBreakdown: [
      { label: "항공권", amount: "28~38만 원" },
      { label: "숙소", amount: "36~55만 원" },
      { label: "투어·티켓", amount: "8~18만 원" },
    ],
    itinerarySummary: [
      "1일차: 난바·도톤보리 대표 야경 동선",
      "2일차: 오사카성·우메다·쇼핑 중심 코스",
      "3일차: USJ 또는 교토/나라 당일치기 중 선택",
      "4일차: 구로몬시장·마지막 쇼핑 후 공항 이동",
    ],
  },
  {
    slug: "fukuoka-budget-2n3d",
    city: "fukuoka",
    cityCode: "FUK",
    title: "후쿠오카 가성비 2박3일",
    miniTitle: "후쿠오카 가성비",
    budgetLabel: "1인 50~70만 원 기준",
    miniBudgetLabel: "2박3일 · 50~70만",
    shortDescription: "하카타·텐진·나카스 도심을 중심으로 짧고 실속 있게 다녀오는 샘플 플랜이에요.",
    miniDescription: "도심 실속형",
    duration: "2박3일",
    nights: 2,
    tags: ["가성비", "항공+숙소", "도심 중심"],
    icon: "coins",
    budgetPreset: "budget",
    defaultBudgetPerPerson: 600000,
    packageType: "flight_hotel",
    nearbyMode: "light",
    styles: ["food", "sightseeing"],
    planType: "cityBudget",
    routeStyle: "도심 실속형",
    nearbyTrip: "lightOptional",
    recommendedExtras: "ticketPassOnly",
    budgetBreakdown: [
      { label: "항공권", amount: "24~32만 원" },
      { label: "숙소", amount: "20~30만 원" },
      { label: "선택 티켓", amount: "3~8만 원" },
    ],
    itinerarySummary: [
      "1일차: 하카타 체크인 후 라멘과 나카스 야타이",
      "2일차: 텐진·다이묘 카페와 도심 쇼핑",
      "3일차: 하카타역 기념품 정리 후 공항 이동",
    ],
  },
  {
    slug: "fukuoka-onsen-3n4d",
    city: "fukuoka",
    cityCode: "FUK",
    title: "후쿠오카 온천 3박4일",
    miniTitle: "후쿠오카 온천",
    budgetLabel: "1인 80~120만 원 기준",
    miniBudgetLabel: "3박4일 · 80~120만",
    shortDescription: "후쿠오카 도심과 유후인·벳푸 같은 근교 온천을 함께 보는 샘플 플랜이에요.",
    miniDescription: "근교 온천",
    duration: "3박4일",
    nights: 3,
    tags: ["온천", "근교", "휴식"],
    icon: "onsen",
    budgetPreset: "standard",
    defaultBudgetPerPerson: 1000000,
    packageType: "flight_hotel_tour",
    nearbyMode: "standard",
    styles: ["onsen", "sightseeing"],
    note: "근교 온천 포함",
    planType: "onsen",
    routeStyle: "근교 온천",
    nearbyTrip: "true",
    recommendedExtras: "onsenTourAndPass",
    budgetBreakdown: [
      { label: "항공권", amount: "25~35만 원" },
      { label: "숙소", amount: "35~55만 원" },
      { label: "온천·근교 티켓", amount: "10~20만 원" },
    ],
    itinerarySummary: [
      "1일차: 하카타 체크인과 나카스 야경",
      "2일차: 다자이후 반나절과 텐진 산책",
      "3일차: 유후인 또는 벳푸 온천형 근교 코스",
      "4일차: 하카타역 기념품 정리 후 공항 이동",
    ],
  },
];

export function findBudgetTemplate(slug: string) {
  return budgetTemplates.find((template) => template.slug === slug);
}
