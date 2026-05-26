type PresetStyle = "food" | "shopping" | "sightseeing" | "onsen";

export type FukuokaTwoNightPresetType =
  | "standard"
  | "food"
  | "shopping"
  | "sightseeing"
  | "onsen"
  | "food_shopping"
  | "food_sightseeing"
  | "food_onsen"
  | "shopping_sightseeing"
  | "shopping_onsen"
  | "sightseeing_onsen";

export type PresetItineraryDay = {
  day: number;
  title: string;
  description: string;
  spots: string[];
};

export type PresetItinerary = {
  key: string;
  typeKey: FukuokaTwoNightPresetType;
  headline: string;
  description: string;
  days: PresetItineraryDay[];
};

const PRESET_STYLE_ORDER: PresetStyle[] = ["food", "shopping", "sightseeing", "onsen"];

const FUKUOKA_TWO_NIGHT_PRESETS: Record<FukuokaTwoNightPresetType, PresetItinerary> = {
  standard: {
    key: "FUK_2_standard",
    typeKey: "standard",
    headline: "후쿠오카 대표 코스 2박3일",
    description: "하카타·텐진·다자이후를 중심으로 처음 가는 후쿠오카를 무난하게 둘러보는 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·나카스 도착일 코스",
        description: "도착 후 하카타와 나카스 중심으로 후쿠오카 첫날을 시작해요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "다자이후·모모치 대표 코스",
        description: "다자이후와 모모치 해변을 연결해 후쿠오카 대표 코스를 둘러봐요.",
        spots: ["다자이후텐만구", "오호리공원", "모모치해변"],
      },
      {
        day: 3,
        title: "텐진·하카타 마무리 코스",
        description: "텐진과 하카타역 주변에서 쇼핑을 정리하고 공항으로 이동해요.",
        spots: ["텐진", "하카타역", "후쿠오카공항"],
      },
    ],
  },
  food: {
    key: "FUK_2_food",
    typeKey: "food",
    headline: "후쿠오카 맛집 2박3일",
    description: "하카타 라멘, 모츠나베, 나카스 야타이를 중심으로 먹거리 비중을 높인 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타 라멘·나카스 야타이 코스",
        description: "도착 후 하카타 라멘과 나카스 야타이로 첫날을 채워요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "텐진·다이묘 로컬 맛집 코스",
        description: "텐진과 다이묘 주변에서 카페와 로컬 맛집을 즐겨요.",
        spots: ["텐진", "다이묘", "오호리공원"],
      },
      {
        day: 3,
        title: "하카타역 기념품·마무리 식사",
        description: "하카타역 주변에서 마지막 식사와 기념품 쇼핑을 정리해요.",
        spots: ["하카타역", "하카타 한큐", "후쿠오카공항"],
      },
    ],
  },
  shopping: {
    key: "FUK_2_shopping",
    typeKey: "shopping",
    headline: "후쿠오카 쇼핑 2박3일",
    description: "텐진·캐널시티·하카타역을 중심으로 쇼핑 시간을 넉넉히 둔 일정이에요.",
    days: [
      {
        day: 1,
        title: "캐널시티·하카타 쇼핑 코스",
        description: "도착 후 캐널시티와 하카타역 주변에서 가볍게 쇼핑해요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "텐진·다이묘 쇼핑 코스",
        description: "텐진과 다이묘를 중심으로 쇼핑과 카페 시간을 넉넉히 가져요.",
        spots: ["텐진", "다이묘", "파르코"],
      },
      {
        day: 3,
        title: "하카타역 기념품 정리 코스",
        description: "하카타역에서 기념품을 정리하고 공항으로 이동해요.",
        spots: ["하카타역", "하카타 한큐", "후쿠오카공항"],
      },
    ],
  },
  sightseeing: {
    key: "FUK_2_sightseeing",
    typeKey: "sightseeing",
    headline: "후쿠오카 관광 2박3일",
    description: "다자이후·오호리공원·모모치 해변을 중심으로 명소 비중을 높인 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·나카스 도심 관광",
        description: "하카타와 나카스 중심으로 도심 분위기를 가볍게 둘러봐요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "다자이후·오호리·모모치 코스",
        description: "다자이후와 오호리공원, 모모치 해변을 연결해 대표 명소를 둘러봐요.",
        spots: ["다자이후텐만구", "오호리공원", "모모치해변"],
      },
      {
        day: 3,
        title: "텐진·하카타 마무리 코스",
        description: "텐진과 하카타역 주변을 정리하고 공항으로 이동해요.",
        spots: ["텐진", "하카타역", "후쿠오카공항"],
      },
    ],
  },
  onsen: {
    key: "FUK_2_onsen",
    typeKey: "onsen",
    headline: "후쿠오카 온천 2박3일",
    description: "후쿠오카 도심 일정에 유후인 또는 벳푸 온천 코스를 더한 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·나카스 도착일 코스",
        description: "도착 후 하카타와 나카스 중심으로 가볍게 첫날을 보내요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "유후인 또는 벳푸 온천 코스",
        description: "유후인이나 벳푸 근교로 이동해 온천과 휴식 시간을 가져요.",
        spots: ["유후인", "긴린코", "벳푸"],
      },
      {
        day: 3,
        title: "하카타역 마무리 코스",
        description: "하카타역 주변에서 여유 있게 정리하고 공항으로 이동해요.",
        spots: ["하카타역", "하카타 한큐", "후쿠오카공항"],
      },
    ],
  },
  food_shopping: {
    key: "FUK_2_food_shopping",
    typeKey: "food_shopping",
    headline: "후쿠오카 맛집·쇼핑 2박3일",
    description: "하카타와 텐진을 중심으로 먹거리와 쇼핑을 균형 있게 즐기는 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타 맛집·캐널시티 코스",
        description: "도착 후 하카타 맛집과 캐널시티 쇼핑을 함께 즐겨요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "텐진 쇼핑·다이묘 맛집 코스",
        description: "텐진 쇼핑과 다이묘 맛집을 연결해 하루를 채워요.",
        spots: ["텐진", "다이묘", "오호리공원"],
      },
      {
        day: 3,
        title: "하카타역 기념품·마무리 식사",
        description: "하카타역에서 기념품과 마지막 식사를 정리해요.",
        spots: ["하카타역", "하카타 한큐", "후쿠오카공항"],
      },
    ],
  },
  food_sightseeing: {
    key: "FUK_2_food_sightseeing",
    typeKey: "food_sightseeing",
    headline: "후쿠오카 맛집·관광 2박3일",
    description: "대표 명소를 둘러보면서 하카타와 나카스 먹거리를 함께 넣은 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·나카스 맛집 코스",
        description: "하카타와 나카스 중심으로 첫날 맛집 동선을 잡아요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "다자이후·모모치 관광 코스",
        description: "다자이후와 모모치 해변을 둘러보고 저녁에는 도심 맛집을 즐겨요.",
        spots: ["다자이후텐만구", "오호리공원", "모모치해변"],
      },
      {
        day: 3,
        title: "텐진·하카타 마무리 코스",
        description: "텐진과 하카타역 주변에서 마지막 식사와 이동을 정리해요.",
        spots: ["텐진", "하카타역", "후쿠오카공항"],
      },
    ],
  },
  food_onsen: {
    key: "FUK_2_food_onsen",
    typeKey: "food_onsen",
    headline: "후쿠오카 맛집·온천 2박3일",
    description: "후쿠오카 도심 먹거리와 유후인·벳푸 온천 코스를 함께 넣은 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·나카스 맛집 코스",
        description: "도착 후 하카타와 나카스에서 후쿠오카 먹거리를 즐겨요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "유후인·벳푸 온천 코스",
        description: "유후인이나 벳푸로 이동해 온천과 근교 산책을 즐겨요.",
        spots: ["유후인", "긴린코", "벳푸"],
      },
      {
        day: 3,
        title: "하카타역 마무리 식사 코스",
        description: "하카타역 주변에서 마지막 식사와 기념품을 정리해요.",
        spots: ["하카타역", "하카타 한큐", "후쿠오카공항"],
      },
    ],
  },
  shopping_sightseeing: {
    key: "FUK_2_shopping_sightseeing",
    typeKey: "shopping_sightseeing",
    headline: "후쿠오카 쇼핑·관광 2박3일",
    description: "텐진 쇼핑과 다자이후·모모치 관광을 함께 넣은 균형형 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·캐널시티 쇼핑 코스",
        description: "도착 후 하카타와 캐널시티 중심으로 쇼핑을 시작해요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "다자이후·모모치 관광 코스",
        description: "다자이후와 모모치 해변을 연결해 대표 명소를 둘러봐요.",
        spots: ["다자이후텐만구", "오호리공원", "모모치해변"],
      },
      {
        day: 3,
        title: "텐진·하카타 쇼핑 마무리",
        description: "텐진과 하카타역에서 마지막 쇼핑을 정리하고 공항으로 이동해요.",
        spots: ["텐진", "하카타역", "후쿠오카공항"],
      },
    ],
  },
  shopping_onsen: {
    key: "FUK_2_shopping_onsen",
    typeKey: "shopping_onsen",
    headline: "후쿠오카 쇼핑·온천 2박3일",
    description: "도심 쇼핑과 근교 온천을 함께 넣어 무리하지 않게 쉬어가는 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·캐널시티 쇼핑 코스",
        description: "도착 후 하카타와 캐널시티에서 가볍게 쇼핑해요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "유후인 또는 벳푸 온천 코스",
        description: "유후인이나 벳푸에서 온천과 산책 중심으로 하루를 보내요.",
        spots: ["유후인", "긴린코", "벳푸"],
      },
      {
        day: 3,
        title: "텐진·하카타 쇼핑 마무리",
        description: "텐진과 하카타역에서 기념품을 정리하고 공항으로 이동해요.",
        spots: ["텐진", "하카타역", "후쿠오카공항"],
      },
    ],
  },
  sightseeing_onsen: {
    key: "FUK_2_sightseeing_onsen",
    typeKey: "sightseeing_onsen",
    headline: "후쿠오카 관광·온천 2박3일",
    description: "후쿠오카 대표 명소와 유후인·벳푸 온천을 함께 넣은 근교 확장형 일정이에요.",
    days: [
      {
        day: 1,
        title: "하카타·나카스 도심 관광",
        description: "하카타와 나카스 중심으로 도착일 도심 코스를 둘러봐요.",
        spots: ["하카타역", "캐널시티 하카타", "나카스"],
      },
      {
        day: 2,
        title: "유후인·벳푸 온천 관광 코스",
        description: "유후인이나 벳푸에서 온천과 근교 관광을 함께 즐겨요.",
        spots: ["유후인", "긴린코", "벳푸"],
      },
      {
        day: 3,
        title: "텐진·하카타 마무리 코스",
        description: "텐진과 하카타역 주변을 정리하고 공항으로 이동해요.",
        spots: ["텐진", "하카타역", "후쿠오카공항"],
      },
    ],
  },
};

function isPresetStyle(style: string): style is PresetStyle {
  return PRESET_STYLE_ORDER.includes(style as PresetStyle);
}

export function normalizeFukuokaTwoNightPresetType(styles: string[] = []): FukuokaTwoNightPresetType {
  const selected = Array.from(new Set(styles.filter(isPresetStyle))).sort(
    (a, b) => PRESET_STYLE_ORDER.indexOf(a) - PRESET_STYLE_ORDER.indexOf(b),
  );

  if (selected.length === 0) {
    return "standard";
  }

  if (selected.length === 1) {
    return selected[0];
  }

  return `${selected[0]}_${selected[1]}` as FukuokaTwoNightPresetType;
}

export function getFukuokaTwoNightItineraryPreset(input: {
  city: "fukuoka" | "osaka";
  nights: number;
  days: number;
  travelStyles: string[];
}) {
  if (input.city !== "fukuoka" || input.nights !== 2 || input.days !== 3) {
    return null;
  }

  return FUKUOKA_TWO_NIGHT_PRESETS[normalizeFukuokaTwoNightPresetType(input.travelStyles)];
}
