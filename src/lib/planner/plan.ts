import {
  createItineraryOutline as createTemplateItineraryOutline,
  normalizeTravelStyle,
} from "./itineraryTemplates";
import { getCityItineraryPreset } from "./itineraryPresets";

export type BudgetPresetId = "budget" | "standard" | "premium";
export type NearbyMode = "light" | "standard" | "comfort";

export type PlanInput = {
  city: "fukuoka" | "osaka";
  startDate: string;
  endDate: string;
  nights: number;
  days: number;
  departureAirport: "ICN" | "GMP" | "PUS" | "CJJ" | "CJU";
  adults: number;
  children: number;
  totalBudget: number;
  visitCount: "first" | "repeat";
  travelStyles: string[];
  budgetPreset?: BudgetPresetId;
  nearbyMode?: NearbyMode;
  entrySource?: string;
  templateTitle?: string;
  routeStyle?: string;
  planType?: string;
  recommendedExtras?: string;
  nearbyTrip?: string;
  localBudgetMode?: "estimated" | "custom";
  customLocalBudget?: number;
  packageType:
    | "flight_hotel_tour"
    | "flight_hotel"
    | "hotel_tour";
};

export type PlanSummary = {
  title: string;
  subtitle: string;
  totalTravelers: number;
  perPersonBudget: number;
  budget: {
    total: number;
    flight: number;
    hotel: number;
    tour: number;
    local: number;
    buffer: number;
    localUsageTotal: number;
    localSpendingEstimate: {
      min: number;
      max: number;
      basisText: string;
      perPersonPerDayMin: number;
      perPersonPerDayMax: number;
      isCustom?: boolean;
    };
    reservationEstimatedTotal: number;
    tripTotalReference: {
      min: number;
      max: number;
    };
    hotelNights: number;
    rooms: number;
    budgetTier: "budget" | "standard" | "comfort";
    budgetAdvice: string;
    costBasisText: string;
    estimatedTotal: number;
    remaining: number;
    status: "within_budget" | "close" | "over_budget";
  };
  recommendationReason: string;
  itineraryHeadline?: string;
  itineraryDescription?: string;
  itineraryOutline: {
    day: number;
    title: string;
    description: string;
    spots?: string[];
    mapMode?: "route" | "options";
    mapOptions?: { label: string; spots: string[] }[];
    presetKey?: string;
  }[];
};

type RawPlanInput = Partial<{
  city: string;
  cityCode: string;
  startDate: string;
  date: string;
  endDate: string;
  returnDate: string;
  nights: number | string;
  departureAirport: string;
  origin: string;
  adults: number | string;
  children: number | string;
  totalBudget: number | string;
  budget: number | string;
  visitCount: string;
  travelStyles: string[];
  styles: string[];
  budgetPreset: string;
  nearbyMode: string;
  entrySource: string;
  templateTitle: string;
  routeStyle: string;
  planType: string;
  recommendedExtras: string;
  nearbyTrip: string;
  localBudgetMode: string;
  customLocalBudget: number | string;
  packageType: string;
  packages: string[];
}>;

const AIRPORT_MULTIPLIER = {
  ICN: 1,
  GMP: 1.05,
  PUS: 0.95,
  CJJ: 1.02,
  CJU: 1.15,
} as const;

const CITY_ROUND_TRIP_PRICE = {
  osaka: 180000,
  fukuoka: 160000,
} as const;

export const MAX_PLAN_NIGHTS = 4;
export const MAX_PLAN_DAYS = MAX_PLAN_NIGHTS + 1;

const CITY_LABEL = {
  osaka: "오사카",
  fukuoka: "후쿠오카",
} as const;

const STYLE_LABEL: Record<string, string> = {
  food: "맛집",
  shopping: "쇼핑",
  sightseeing: "관광",
  family: "가족",
  onsen: "온천",
  couple: "커플",
  solo: "혼자",
};

const LEGACY_STYLE_MAP: Record<string, string> = {
  healing: "onsen",
  local: "sightseeing",
  night: "couple",
  photo: "sightseeing",
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCity(value?: string) {
  if (value === "FUK" || value === "fukuoka") return "fukuoka";
  return "osaka";
}

function normalizeAirport(value?: string): PlanInput["departureAirport"] {
  if (value === "GMP" || value === "PUS" || value === "CJJ" || value === "CJU") return value;
  return "ICN";
}

function normalizeVisitCount(value?: string): PlanInput["visitCount"] {
  return value === "repeat" || value === "second" ? "repeat" : "first";
}

function packageTypeFromPackages(packages?: string[]): PlanInput["packageType"] {
  const set = new Set(packages ?? ["flight", "hotel", "tour"]);
  const hasFlight = set.has("flight");
  const hasHotel = set.has("hotel");
  const hasTour = set.has("tour");
  if (hasFlight && hasHotel && hasTour) return "flight_hotel_tour";
  if (hasFlight && hasHotel) return "flight_hotel";
  if (hasHotel && hasTour) return "hotel_tour";
  return "flight_hotel_tour";
}

function normalizePackageType(value?: string, packages?: string[]) {
  const allowed: PlanInput["packageType"][] = [
    "flight_hotel_tour",
    "flight_hotel",
    "hotel_tour",
  ];
  if (allowed.includes(value as PlanInput["packageType"])) {
    return value as PlanInput["packageType"];
  }
  return packageTypeFromPackages(packages);
}

function normalizeBudgetPreset(value?: string): BudgetPresetId | undefined {
  if (value === "budget" || value === "standard" || value === "premium") {
    return value;
  }
  if (value === "value") return "budget";
  if (value === "luxury") return "premium";
  return undefined;
}

function normalizeNearbyMode(value?: string): NearbyMode | undefined {
  if (value === "light" || value === "standard" || value === "comfort") {
    return value;
  }
  return undefined;
}

function normalizeTravelStyles(styles: string[]) {
  const allowed = new Set(["food", "shopping", "sightseeing", "family", "onsen", "couple", "solo"]);
  const normalized = styles
    .map((style) => LEGACY_STYLE_MAP[style] ?? style)
    .filter((style) => allowed.has(style));

  return [...new Set(normalized)].slice(0, 2);
}

function toUtc(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function calculateNights(startDate: string, endDate: string) {
  const diff = Math.round((toUtc(endDate) - toUtc(startDate)) / 86400000);
  return diff;
}

function roundWon(value: number) {
  return Math.max(0, Math.round(value / 1000) * 1000);
}

function roundToNearestManwon(value: number) {
  return Math.max(0, Math.round(value / 10000) * 10000);
}

export function normalizePlanInput(raw: RawPlanInput = {}): PlanInput {
  const city = normalizeCity(raw.city ?? raw.cityCode);
  const startDate = raw.startDate ?? raw.date ?? addDays(new Date().toISOString().slice(0, 10), 45);
  const fallbackNights = Math.max(1, toNumber(raw.nights, 3));
  const endDate = raw.endDate ?? raw.returnDate ?? addDays(startDate, fallbackNights);
  const nights = calculateNights(startDate, endDate);
  if (nights < 1) {
    throw new Error("INVALID_TRIP_DATES");
  }
  if (nights > MAX_PLAN_NIGHTS) {
    throw new Error("MAX_TRIP_NIGHTS_EXCEEDED");
  }
  const adults = Math.max(1, toNumber(raw.adults, 2));
  const children = 0;

  return {
    city,
    startDate,
    endDate,
    nights,
    days: nights + 1,
    departureAirport: normalizeAirport(raw.departureAirport ?? raw.origin),
    adults,
    children,
    totalBudget: Math.max(0, toNumber(raw.totalBudget ?? raw.budget, 0)),
    visitCount: normalizeVisitCount(raw.visitCount),
    travelStyles: normalizeTravelStyles(raw.travelStyles ?? raw.styles ?? []),
    budgetPreset: normalizeBudgetPreset(raw.budgetPreset),
    nearbyMode: normalizeNearbyMode(raw.nearbyMode),
    entrySource: typeof raw.entrySource === "string" ? raw.entrySource : "",
    templateTitle: typeof raw.templateTitle === "string" ? raw.templateTitle : "",
    routeStyle: typeof raw.routeStyle === "string" ? raw.routeStyle : "",
    planType: typeof raw.planType === "string" ? raw.planType : "",
    recommendedExtras: typeof raw.recommendedExtras === "string" ? raw.recommendedExtras : "",
    nearbyTrip: typeof raw.nearbyTrip === "string" ? raw.nearbyTrip : "",
    localBudgetMode: raw.localBudgetMode === "custom" ? "custom" : "estimated",
    customLocalBudget: Math.max(0, toNumber(raw.customLocalBudget, 0)),
    packageType: normalizePackageType(raw.packageType, raw.packages),
  };
}

function hasFlight(packageType: PlanInput["packageType"]) {
  return packageType === "flight_hotel_tour" || packageType === "flight_hotel";
}

function hasHotel(packageType: PlanInput["packageType"]) {
  return packageType === "flight_hotel_tour" || packageType === "flight_hotel" || packageType === "hotel_tour";
}

function hasTour(packageType: PlanInput["packageType"]) {
  return packageType === "flight_hotel_tour" || packageType === "hotel_tour";
}

type BookableRates = {
  hotel: number;
  tour: number;
};

export function applyStyleAdjustments(
  rates: BookableRates,
  styles: string[],
) {
  const next = { ...rates };
  const adjust = (key: keyof typeof next, delta: number) => {
    if (next[key] > 0) next[key] += delta;
  };

  styles.forEach((style) => {
    if (style === "family" || style === "couple") {
      adjust("hotel", 0.08);
      adjust("tour", -0.08);
    }
    if (style === "food" || style === "shopping") {
      adjust("hotel", 0.03);
      adjust("tour", -0.03);
    }
    if (style === "sightseeing" || style === "solo") {
      adjust("tour", 0.08);
      adjust("hotel", -0.08);
    }
    if (style === "onsen") {
      adjust("tour", 0.08);
      adjust("hotel", -0.02);
    }
  });

  const activeKeys = (Object.keys(next) as Array<keyof typeof next>).filter((key) => next[key] > 0);
  activeKeys.forEach((key) => {
    next[key] = Math.max(0.03, next[key]);
  });
  const total = activeKeys.reduce((sum, key) => sum + next[key], 0) || 1;
  activeKeys.forEach((key) => {
    next[key] = next[key] / total;
  });
  return next;
}

function getBudgetTier(perPersonBudget: number): PlanSummary["budget"]["budgetTier"] {
  if (perPersonBudget <= 600000) return "budget";
  if (perPersonBudget <= 900000) return "standard";
  return "comfort";
}

function dailyLocalBudgetByTier(tier: PlanSummary["budget"]["budgetTier"]) {
  if (tier === "budget") return 50000;
  if (tier === "standard") return 70000;
  return 90000;
}

function roomNightRateByTier(tier: PlanSummary["budget"]["budgetTier"]) {
  if (tier === "budget") return 85000;
  if (tier === "standard") return 120000;
  return 170000;
}

function cityLocalMultiplier(city: PlanInput["city"]) {
  return city === "osaka" ? 1.05 : 1;
}

function styleLocalMultiplier(styles: string[]) {
  let bonus = 0;
  styles.forEach((style) => {
    if (style === "food") bonus += 0.15;
    if (style === "shopping") bonus += 0.15;
    if (style === "family") bonus += 0.05;
    if (style === "couple") bonus += 0.05;
  });
  return Math.min(1.25, 1 + bonus);
}

function cityHotelMultiplier(city: PlanInput["city"]) {
  return city === "osaka" ? 1.1 : 1;
}

function styleHotelMultiplier(city: PlanInput["city"], styles: string[]) {
  let bonus = 0;
  styles.forEach((style) => {
    if (style === "family") bonus += 0.1;
    if (style === "couple") bonus += 0.1;
    if (style === "onsen") bonus += city === "fukuoka" ? 0.15 : 0.05;
  });
  return Math.min(1.25, 1 + bonus);
}

function calculateRooms(totalTravelers: number) {
  return Math.ceil(totalTravelers / 2);
}

function calculateHotelBudget(input: PlanInput, totalTravelers: number, tier: PlanSummary["budget"]["budgetTier"]) {
  if (!hasHotel(input.packageType)) return 0;
  const rooms = calculateRooms(totalTravelers);
  const rate = roomNightRateByTier(tier);
  const multiplier = cityHotelMultiplier(input.city) * styleHotelMultiplier(input.city, input.travelStyles);
  return roundToNearestManwon(rate * input.nights * rooms * multiplier);
}

function calculateTourBudget(input: PlanInput, totalTravelers: number) {
  if (!hasTour(input.packageType)) return 0;
  const perTravelerRates = input.travelStyles.map((style) => {
    if (style === "sightseeing") return 50000;
    if (style === "onsen") return input.city === "fukuoka" ? 80000 : 30000;
    if (style === "family" || style === "couple") return 40000;
    if (style === "food" || style === "shopping" || style === "solo") return 25000;
    return 30000;
  });
  const perTraveler = Math.max(30000, ...perTravelerRates);
  return roundToNearestManwon(perTraveler * totalTravelers);
}

function calculateLocalBudget(input: PlanInput, tier: PlanSummary["budget"]["budgetTier"]) {
  const adultDailyLocalBudget = dailyLocalBudgetByTier(tier);
  const childDailyLocalBudget = adultDailyLocalBudget * 0.65;
  const localDays = Math.max(1, input.days - 0.5);
  const multiplier = cityLocalMultiplier(input.city) * styleLocalMultiplier(input.travelStyles);
  const adultLocal = input.adults * adultDailyLocalBudget * multiplier * localDays;
  const childLocal = input.children * childDailyLocalBudget * multiplier * localDays;
  return roundToNearestManwon(adultLocal + childLocal);
}

function calculateLocalSpendingEstimate(input: PlanInput): PlanSummary["budget"]["localSpendingEstimate"] {
  if (input.localBudgetMode === "custom" && input.customLocalBudget && input.customLocalBudget > 0) {
    return {
      min: input.customLocalBudget,
      max: input.customLocalBudget,
      basisText: "직접 입력한 현지 사용 예산이에요.",
      perPersonPerDayMin: 0,
      perPersonPerDayMax: 0,
      isCustom: true,
    };
  }

  const table = {
    fukuoka: {
      budget: [40000, 60000],
      standard: [55000, 80000],
      premium: [75000, 110000],
    },
    osaka: {
      budget: [45000, 65000],
      standard: [60000, 90000],
      premium: [85000, 120000],
    },
  } as const;
  const tier = input.budgetPreset === "premium" ? "premium" : input.budgetPreset === "budget" ? "budget" : "standard";
  let [minDaily, maxDaily] = table[input.city][tier].map(Number);
  const styles = new Set(input.travelStyles);
  if (styles.has("food")) {
    minDaily *= 1.1;
    maxDaily *= 1.15;
  }
  if (styles.has("shopping")) {
    minDaily *= 1.05;
    maxDaily *= 1.25;
  }
  if (styles.has("family")) maxDaily *= 1.1;
  if (styles.has("onsen")) maxDaily *= 1.1;
  if (styles.has("couple")) maxDaily *= 1.1;

  const localDays = Math.max(1, input.days - 0.5);
  const min = roundToNearestManwon((input.adults * minDaily + input.children * minDaily * 0.65) * localDays);
  const max = roundToNearestManwon((input.adults * maxDaily + input.children * maxDaily * 0.65) * localDays);
  return {
    min,
    max: Math.max(min, max),
    basisText: "식비·교통·카페·간식 등은 여행 스타일에 따라 달라질 수 있어요.",
    perPersonPerDayMin: Math.round(minDaily),
    perPersonPerDayMax: Math.round(maxDaily),
  };
}

function calculateBufferBudget(totalBudget: number, localBudget: number) {
  return roundToNearestManwon(Math.max(totalBudget * 0.05, localBudget * 0.08, 50000));
}

function calculateBudgetStatus(totalBudget: number, remaining: number): PlanSummary["budget"]["status"] {
  if (remaining >= totalBudget * 0.05) return "within_budget";
  if (remaining >= -totalBudget * 0.05) return "close";
  return "over_budget";
}

function createBudgetAdvice(status: PlanSummary["budget"]["status"], styles: string[]) {
  const styleSet = new Set(styles);
  if (status === "over_budget") {
    if (styleSet.has("solo")) {
      return "현재 구성은 예산을 초과할 수 있어요. 혼자 여행은 숙소 1실 비용 부담이 커질 수 있어 가성비 숙소나 항공 시간대를 조정해보세요.";
    }
    if (styleSet.has("family") || styleSet.has("couple")) {
      return "현재 구성은 예산을 초과할 수 있어요. 동행 여행은 숙소 만족도가 중요하므로, 숙소를 크게 낮추기보다 투어 수나 항공 시간대를 조정하는 편이 좋아요.";
    }
    if (styleSet.has("food") || styleSet.has("shopping")) {
      return "현재 구성은 예산을 초과할 수 있어요. 맛집·쇼핑 성향은 현지 사용 예산이 필요하므로, 숙소나 투어 예산을 조금 줄이는 편이 현실적이에요.";
    }
    if (styleSet.has("onsen")) {
      return "현재 구성은 예산을 초과할 수 있어요. 온천 일정을 유지하려면 숙소 등급이나 항공 시간대를 조정해 예산을 맞추는 편이 좋아요.";
    }
    return "현재 구성은 예산을 초과할 수 있어요. 숙소 등급을 낮추거나 투어 구성을 줄이면 예산 안에 맞추기 쉬워요.";
  }
  if (status === "close") {
    return "예산에 거의 맞는 구성이에요. 항공권 가격 변동이나 현지 식비를 조금 여유 있게 확인해보세요.";
  }
  return "현재 구성은 입력한 예산 안에서 무리 없이 진행 가능한 편이에요.";
}

function presetRecommendationCopy(input: PlanInput) {
  if (input.routeStyle) {
    return `${input.routeStyle} 플랜에 맞춰 예산과 이동 동선을 구성했어요.`;
  }
  if (input.budgetPreset === "budget" || input.nearbyMode === "light") {
    return "가성비 예산에 맞춰 시내 중심의 짧고 알찬 동선으로 구성했어요.";
  }
  if (input.budgetPreset === "premium" || input.nearbyMode === "comfort") {
    return "프리미엄 예산에 맞춰 숙소 만족도와 근교/테마 경험을 여유롭게 고려했어요.";
  }
  return "표준 예산에 맞춰 시내 핵심 동선과 선택형 대표 코스를 균형 있게 구성했어요.";
}

function styleRecommendationCopy(input: PlanInput) {
  const city = CITY_LABEL[input.city];
  const styles = new Set(input.travelStyles);
  if (styles.has("family")) {
    return "가족 성향을 반영해 이동 부담이 적은 숙소 위치와 반나절 단위 동선을 우선 고려했어요.";
  }
  if (input.city === "fukuoka" && styles.has("onsen")) {
    return "온천 성향을 반영해 유후인·벳부 같은 근교 온천 후보를 우선순위에 두었어요.";
  }
  if (input.city === "osaka" && styles.has("onsen")) {
    return "온천 성향은 오사카에서는 스파·휴식·숙소 만족도 중심으로 가볍게 보정했어요.";
  }
  if (styles.has("couple") && styles.has("sightseeing")) {
    return "커플·관광 성향을 반영해 야경, 전망대, 대표 명소가 자연스럽게 이어지는 동선을 고려했어요.";
  }
  if (styles.has("food") && styles.has("shopping")) {
    return "맛집·쇼핑 성향을 반영해 중심 상권 접근성과 자유시간을 넉넉히 확보했어요.";
  }
  if (styles.has("solo")) {
    return "혼자 여행에 맞춰 이동이 쉽고 자유도가 높은 시내 동선을 우선 배치했어요.";
  }
  if (styles.has("sightseeing")) {
    if (input.nearbyMode === "light" || input.budgetPreset === "budget" || input.days <= 3) {
      return `${city}의 시내 대표 명소와 핵심 동선을 일정 강도에 맞춰 반영했어요.`;
    }
    return `${city}의 대표 관광지와 근교 선택지를 일정 강도에 맞춰 반영했어요.`;
  }
  return "선택한 여행 성향을 바탕으로 무리 없는 이동 흐름을 우선했어요.";
}

function createRecommendationReason(input: PlanInput) {
  return `${presetRecommendationCopy(input)} ${styleRecommendationCopy(input)}`;
}

function createItineraryTemplateResult(input: PlanInput) {
  if (input.days > MAX_PLAN_DAYS) {
    throw new Error("MAX_TRIP_DAYS_EXCEEDED");
  }

  const preset = getCityItineraryPreset(input);
  if (preset) {
    return {
      headline: preset.headline,
      description: preset.description,
      days: preset.days.map((day) => ({
        ...day,
        presetKey: preset.key,
      })),
    };
  }

  const styles = normalizeTravelStyles(input.travelStyles.length ? input.travelStyles : ["sightseeing"]);
  const primaryStyle = normalizeTravelStyle(styles[0]) ?? "sightseeing";
  const secondaryStyle = normalizeTravelStyle(styles[1]);

  return createTemplateItineraryOutline({
    city: input.city,
    days: input.days,
    nights: input.nights,
    primaryStyle,
    secondaryStyle,
  });
}

export function createPlanSummary(input: PlanInput): PlanSummary {
  const itinerary = createItineraryTemplateResult(input);
  const totalTravelers = Math.max(1, input.adults + input.children);
  const perPersonBudget = Math.round(input.totalBudget / totalTravelers);
  const budgetTier = getBudgetTier(perPersonBudget);
  const rooms = calculateRooms(totalTravelers);
  const flight = hasFlight(input.packageType)
    ? roundWon(CITY_ROUND_TRIP_PRICE[input.city] * AIRPORT_MULTIPLIER[input.departureAirport] * totalTravelers)
    : 0;
  const hotel = calculateHotelBudget(input, totalTravelers, budgetTier);
  const tour = calculateTourBudget(input, totalTravelers);
  const local = calculateLocalBudget(input, budgetTier);
  const buffer = calculateBufferBudget(input.totalBudget, local);
  const localUsageTotal = local + buffer;
  const reservationEstimatedTotal = flight + hotel + tour;
  const localSpendingEstimate = calculateLocalSpendingEstimate(input);
  const tripTotalReference = {
    min: reservationEstimatedTotal + localSpendingEstimate.min,
    max: reservationEstimatedTotal + localSpendingEstimate.max,
  };
  const estimatedTotal = reservationEstimatedTotal;
  const remaining = input.totalBudget - estimatedTotal;
  const status = calculateBudgetStatus(input.totalBudget, remaining);
  const styleLabels = input.travelStyles.map((style) => STYLE_LABEL[style] ?? style).join(" · ");
  const costBasisText = "숙소는 1실 1박 기준, 현지 사용 예산은 1인 1일 기준으로 계산했어요.";

  return {
    title: `${CITY_LABEL[input.city]} ${input.nights}박 ${input.days}일 예산 플랜`,
    subtitle: `${totalTravelers}명 기준 · 1인 약 ${perPersonBudget.toLocaleString("ko-KR")}원`,
    totalTravelers,
    perPersonBudget,
    budget: {
      total: input.totalBudget,
      flight,
      hotel,
      tour,
      local,
      buffer,
      localUsageTotal,
      localSpendingEstimate,
      reservationEstimatedTotal,
      tripTotalReference,
      hotelNights: input.nights,
      rooms,
      budgetTier,
      budgetAdvice: createBudgetAdvice(status, input.travelStyles),
      costBasisText,
      estimatedTotal,
      remaining,
      status,
    },
    recommendationReason: createRecommendationReason(input) + (styleLabels ? ` (${styleLabels} 반영)` : ""),
    itineraryHeadline: itinerary.headline,
    itineraryDescription: itinerary.description,
    itineraryOutline: itinerary.days,
  };
}

export function createPlan(raw: RawPlanInput) {
  const planInput = normalizePlanInput(raw);
  const planSummary = createPlanSummary(planInput);
  return { planInput, planSummary };
}

export function getPlanSummaryVerificationCases() {
  return [
    createPlan({
      cityCode: "KIX",
      date: "2026-06-11",
      returnDate: "2026-06-14",
      adults: 2,
      budget: 800000,
      visitCount: "first",
      styles: ["food", "shopping"],
      packages: ["flight", "hotel", "tour"],
    }),
    createPlan({
      cityCode: "FUK",
      date: "2026-06-11",
      returnDate: "2026-06-13",
      adults: 2,
      budget: 700000,
      visitCount: "first",
      styles: ["family", "onsen"],
      packages: ["flight", "hotel", "tour"],
    }),
    createPlan({
      cityCode: "KIX",
      date: "2026-06-11",
      returnDate: "2026-06-14",
      adults: 2,
      budget: 800000,
      packages: ["hotel", "tour"],
    }),
    createPlan({
      cityCode: "KIX",
      date: "2026-06-11",
      returnDate: "2026-06-14",
      adults: 2,
      budget: 250000,
      packages: ["flight", "hotel", "tour"],
    }),
  ];
}
