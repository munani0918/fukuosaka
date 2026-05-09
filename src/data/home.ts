export type HeroTagIcon = "plane" | "coins" | "sparkles";
export type BudgetPresetIcon = "wallet" | "sparkles" | "crown";
export type SearchTabIcon = "stay" | "tour" | "flight";
export type BottomTabIcon = "home" | "planner" | "stay" | "tour" | "my";

export type HomeArtVariant =
  | "weather-osaka"
  | "weather-fukuoka"
  | "flight-fukuoka"
  | "flight-osaka"
  | "stay-osaka"
  | "stay-fukuoka"
  | "tour-osaka"
  | "tour-fukuoka"
  | "promo";

export type HeroTag = {
  icon: HeroTagIcon;
  label: string;
};

export type HeroData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tags: HeroTag[];
  ctaLabel: string;
};

export type BudgetPreset = {
  id: "budget" | "standard" | "premium" | "value" | "luxury";
  label: string;
  displayRange?: string;
  budgetRange?: string;
  summary: string;
  icon: BudgetPresetIcon;
  popular?: boolean;
  defaultBudgetPerPerson?: number;
  presetBudget?: number;
  nights: number;
  days?: number;
  defaultPackageType?: "flight_hotel_tour" | "flight_hotel";
  nearbyMode?: "light" | "standard" | "comfort";
};

export type WeatherTone = "sunny" | "cloudy" | "rainy";

export type WeatherForecast = {
  day: string;
  tone: WeatherTone;
  high: number;
  low: number;
};

export type WeatherCardData = {
  id: string;
  city: string;
  currentTemp: number;
  condition: string;
  high: number;
  low: number;
  forecast: WeatherForecast[];
  artVariant: Extract<HomeArtVariant, "weather-osaka" | "weather-fukuoka">;
  apiConfig: {
    provider: "Open-Meteo";
    latitude: number;
    longitude: number;
    timezone: string;
    currentFields: string[];
    dailyFields: string[];
  };
};

export type FlightDealData = {
  id: string;
  city: string;
  cityCode: "FUK" | "KIX";
  priceLabel: string;
  basisLabel: string;
  note: string;
  artVariant: Extract<HomeArtVariant, "flight-fukuoka" | "flight-osaka">;
  href?: string;
};

export type SearchTabData = {
  id: string;
  label: string;
  icon: SearchTabIcon;
  helper: string;
  href: string;
  keywords: string[];
  defaultQuery?: string;
};

export type PromoData = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
};

export type ProductCardData = {
  id: string;
  name: string;
  rating: string;
  reviewCount: string;
  priceLabel: string;
  metaLabel: string;
  href: string;
  ctaLabel: string;
  imageUrl?: string;
  artVariant: Extract<
    HomeArtVariant,
    "stay-osaka" | "stay-fukuoka" | "tour-osaka" | "tour-fukuoka"
  >;
};

export type BottomTabItem = {
  id: string;
  label: string;
  href: string;
  icon: BottomTabIcon;
  active?: boolean;
};

export type HomePageData = {
  hero: HeroData;
  budgetPresets: BudgetPreset[];
  weatherCards: WeatherCardData[];
  flightDeals: FlightDealData[];
  searchTabs: SearchTabData[];
  searchPlaceholder: string;
  promo: PromoData;
  stayCards: ProductCardData[];
  tourCards: ProductCardData[];
  bottomTabs: BottomTabItem[];
};

export const homeMockData: HomePageData = {
  hero: {
    eyebrow: "후쿠오카 · 오사카 예산 플래너",
    title: "FUKUOSAKA",
    subtitle: "항공 · 숙소 · 투어를 예산에 맞게 추천해드려요",
    tags: [
      { icon: "plane", label: "실시간 항공 반영" },
      { icon: "coins", label: "예산 자동 배분" },
      { icon: "sparkles", label: "큐레이션 포함" },
    ],
    ctaLabel: "여행 예산 입력하기",
  },
  budgetPresets: [
    {
      id: "value",
      label: "가성비",
      budgetRange: "50~70만원",
      summary: "LCC + 중급 숙소",
      icon: "wallet",
      presetBudget: 600000,
      nights: 2,
    },
    {
      id: "standard",
      label: "표준",
      budgetRange: "80~120만원",
      summary: "숙소 + 주요 투어",
      icon: "sparkles",
      presetBudget: 1000000,
      nights: 3,
    },
    {
      id: "luxury",
      label: "럭셔리",
      budgetRange: "150만원+",
      summary: "프리미엄 경험",
      icon: "crown",
      presetBudget: 1600000,
      nights: 4,
    },
  ],
  weatherCards: [
    {
      id: "osaka-weather",
      city: "오사카",
      currentTemp: 24,
      condition: "맑음",
      high: 27,
      low: 19,
      artVariant: "weather-osaka",
      forecast: [
        { day: "목", tone: "sunny", high: 25, low: 18 },
        { day: "금", tone: "cloudy", high: 23, low: 17 },
        { day: "토", tone: "rainy", high: 22, low: 16 },
      ],
      apiConfig: {
        provider: "Open-Meteo",
        latitude: 34.6937,
        longitude: 135.5023,
        timezone: "Asia/Tokyo",
        currentFields: ["temperature_2m", "weather_code"],
        dailyFields: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
      },
    },
    {
      id: "fukuoka-weather",
      city: "후쿠오카",
      currentTemp: 22,
      condition: "흐림",
      high: 25,
      low: 18,
      artVariant: "weather-fukuoka",
      forecast: [
        { day: "목", tone: "cloudy", high: 23, low: 18 },
        { day: "금", tone: "sunny", high: 24, low: 19 },
        { day: "토", tone: "rainy", high: 21, low: 17 },
      ],
      apiConfig: {
        provider: "Open-Meteo",
        latitude: 33.5904,
        longitude: 130.4017,
        timezone: "Asia/Tokyo",
        currentFields: ["temperature_2m", "weather_code"],
        dailyFields: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
      },
    },
  ],
  flightDeals: [
    {
      id: "fuk-flight",
      city: "후쿠오카",
      cityCode: "FUK",
      priceLabel: "15.9만~",
      basisLabel: "인천 출발 · 편도 기준",
      note: "가격은 변동될 수 있어요",
      artVariant: "flight-fukuoka",
    },
    {
      id: "kix-flight",
      city: "오사카",
      cityCode: "KIX",
      priceLabel: "19.8만~",
      basisLabel: "인천 출발 · 편도 기준",
      note: "최근 조회 기준 요약",
      artVariant: "flight-osaka",
    },
  ],
  searchTabs: [
    {
      id: "stay",
      label: "숙소",
      icon: "stay",
      helper: "하카타, 난바, 우메다 추천 숙소부터 빠르게 탐색할 수 있어요.",
      href: "/stays",
      keywords: ["하카타", "난바", "료칸"],
      defaultQuery: "오사카",
    },
    {
      id: "tour",
      label: "투어&티켓",
      icon: "tour",
      helper: "유니버설, 시티투어, 패스 같은 보조 상품만 먼저 훑어보세요.",
      href: "/tours",
      keywords: ["시티투어", "패스", "입장권"],
      defaultQuery: "오사카 관광",
    },
    {
      id: "flight",
      label: "항공",
      icon: "flight",
      helper: "예산 플래너 전에 항공만 따로 보고 싶을 때 바로 이동할 수 있어요.",
      href: "/flights",
      keywords: ["인천 출발", "왕복", "직항"],
      defaultQuery: "오사카",
    },
  ],
  searchPlaceholder: "지역, 숙소명 또는 키워드로 검색해보세요",
  promo: {
    title: "이번 달 일본 숙소 쿠폰",
    description: "여기어때 쿠폰 혜택 먼저 확인하고 예약하기",
    buttonLabel: "쿠폰 혜택 보기",
    href: "https://www.yeogieottae.com",
  },
  stayCards: [
    {
      id: "stay-osaka-card",
      name: "호텔 몬토레 오사카",
      rating: "4.6",
      reviewCount: "1,234",
      priceLabel: "1박 최저 89,000원~",
      metaLabel: "오사카 · 우메다",
      href: "/stays?keyword=오사카",
      ctaLabel: "예약하기",
      artVariant: "stay-osaka",
    },
    {
      id: "stay-fukuoka-card",
      name: "후카 호텔 후쿠오카",
      rating: "4.7",
      reviewCount: "982",
      priceLabel: "1박 최저 112,000원~",
      metaLabel: "후쿠오카 · 하카타",
      href: "/stays?keyword=후쿠오카",
      ctaLabel: "예약하기",
      artVariant: "stay-fukuoka",
    },
  ],
  tourCards: [
    {
      id: "tour-osaka-card",
      name: "오사카 핵심 시티투어",
      rating: "4.8",
      reviewCount: "1,376",
      priceLabel: "성인 59,000원~",
      metaLabel: "오사카 · 가이드 투어",
      href: "/tours?keyword=%EC%98%A4%EC%82%AC%EC%B9%B4+%EC%8B%9C%ED%8B%B0%ED%88%AC%EC%96%B4&city=%EC%98%A4%EC%82%AC%EC%B9%B4&category=all&sort=selling_count_desc&page=1&perPage=12",
      ctaLabel: "예약하기",
      artVariant: "tour-osaka",
    },
    {
      id: "tour-fukuoka-card",
      name: "후쿠오카 모모치 & 야나가와",
      rating: "4.7",
      reviewCount: "654",
      priceLabel: "성인 49,000원~",
      metaLabel: "후쿠오카 · 근교 투어",
      href: "/tours?keyword=%ED%9B%84%EC%BF%A0%EC%98%A4%EC%B9%B4+%EA%B7%BC%EA%B5%90%ED%88%AC%EC%96%B4&city=%ED%9B%84%EC%BF%A0%EC%98%A4%EC%B9%B4&category=all&sort=selling_count_desc&page=1&perPage=12",
      ctaLabel: "예약하기",
      artVariant: "tour-fukuoka",
    },
  ],
  bottomTabs: [
    { id: "home", label: "홈", href: "/", icon: "home", active: true },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" },
    { id: "tour", label: "투어", href: "/tours", icon: "tour" },
    { id: "my", label: "마이", href: "#top", icon: "my" },
  ],
};
