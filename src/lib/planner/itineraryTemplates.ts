export type City = "osaka" | "fukuoka";

export type TravelStyle =
  | "food"
  | "shopping"
  | "sightseeing"
  | "family"
  | "onsen"
  | "couple"
  | "solo";

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  tags?: string[];
};

export type ItineraryTemplateInput = {
  city: City;
  nights: number;
  days: number;
  primaryStyle: TravelStyle;
  secondaryStyle?: TravelStyle;
};

export type ItineraryTemplateResult = {
  headline: string;
  description: string;
  days: ItineraryDay[];
};

const TRAVEL_STYLES: TravelStyle[] = [
  "food",
  "shopping",
  "sightseeing",
  "family",
  "onsen",
  "couple",
  "solo",
];

const LEGACY_STYLE_MAP: Record<string, TravelStyle> = {
  healing: "onsen",
  local: "sightseeing",
  night: "couple",
  photo: "sightseeing",
};

const STYLE_LABEL: Record<TravelStyle, string> = {
  food: "맛집",
  shopping: "쇼핑",
  sightseeing: "관광",
  family: "가족",
  onsen: "온천",
  couple: "커플",
  solo: "혼자",
};

type DayRole = "arrival" | "main" | "nearby" | "extra" | "departure";
type DayCopy = Omit<ItineraryDay, "day">;

type StylePlan = {
  headline: string;
  description: string;
  days: Record<DayRole, DayCopy>;
};

function clampDays(days: number) {
  if (days > 5) throw new Error("MAX_TRIP_DAYS_EXCEEDED");
  if (days < 2) throw new Error("INVALID_TRIP_DAYS");
  return days;
}

export function normalizeTravelStyle(style?: string): TravelStyle | undefined {
  const normalized = style ? LEGACY_STYLE_MAP[style] ?? style : undefined;
  return TRAVEL_STYLES.includes(normalized as TravelStyle) ? (normalized as TravelStyle) : undefined;
}

function secondaryPhrase(city: City, secondaryStyle?: TravelStyle) {
  if (!secondaryStyle) return "";
  const osaka = city === "osaka";
  const map: Record<TravelStyle, string> = {
    food: osaka
      ? "구로몬시장이나 우라난바 식도락 시간을 중간에 보강해요."
      : "하카타 라멘, 야타이, 로컬 간식 시간을 중간에 보강해요.",
    shopping: osaka
      ? "우메다와 신사이바시 쇼핑 시간을 무리 없이 끼워 넣어요."
      : "텐진, 하카타역, 캐널시티 쇼핑 시간을 함께 확보해요.",
    sightseeing: osaka
      ? "오사카성, 우메다 전망, 신세카이 같은 대표 명소를 보조로 넣어요."
      : "다자이후, 오호리공원, 모모치 같은 대표 동선을 보조로 넣어요.",
    family: "이동 시간을 짧게 잡고, 중간 휴식과 이른 숙소 복귀를 고려해요.",
    onsen: osaka
      ? "대욕장 숙소나 스파 시간을 확보해 컨디션을 맞춰요."
      : "대욕장 숙소나 유후인·벳푸 온천 선택지를 함께 고려해요.",
    couple: osaka
      ? "도톤보리 야경, 우메다 전망, 강변 산책처럼 분위기 있는 시간을 더해요."
      : "모모치해변, 후쿠오카타워, 나카스 야경처럼 감성 동선을 더해요.",
    solo: "역세권과 카페, 시장처럼 혼자 움직이기 쉬운 자유 시간을 남겨요.",
  };
  return map[secondaryStyle];
}

function withSecondary(copy: DayCopy, city: City, secondaryStyle?: TravelStyle): DayCopy {
  if (!secondaryStyle) return copy;
  const phrase = secondaryPhrase(city, secondaryStyle);
  if (!phrase) return copy;
  return {
    ...copy,
    description: `${copy.description} ${phrase}`,
    tags: [...(copy.tags ?? []), secondaryStyle],
  };
}

const OSAKA_PLANS: Record<TravelStyle, StylePlan> = {
  food: {
    headline: "난바와 도톤보리를 중심으로 시장, 야식, 로컬 맛집을 넉넉히 둔 일정이에요.",
    description: "구로몬시장, 우라난바, 텐마처럼 식도락 권역을 하루 역할에 맞춰 나눕니다.",
    days: {
      arrival: {
        title: "도착 · 도톤보리 식도락",
        description: "체크인 후 난바와 도톤보리에서 가볍게 저녁을 먹고, 우라난바 골목이나 타코야키 간식으로 첫날 분위기를 잡아요.",
        tags: ["food", "osaka_minami"],
      },
      main: {
        title: "구로몬시장 · 우라난바",
        description: "낮에는 구로몬시장에서 해산물과 간식을 보고, 오후에는 난바와 우라난바 로컬 맛집 동선으로 이어가요.",
        tags: ["food", "market"],
      },
      nearby: {
        title: "신세카이 · 텐마 야식",
        description: "신세카이와 츠텐카쿠 주변을 둘러본 뒤, 저녁에는 텐마나 도톤보리에서 야식 중심으로 마무리해요.",
        tags: ["food", "night"],
      },
      extra: {
        title: "우메다 식도락 · 카페",
        description: "우메다 백화점 식품관과 카페를 여유롭게 보고, 마지막 밤은 숙소 접근이 쉬운 맛집 권역에 시간을 남겨요.",
        tags: ["food", "umeda"],
      },
      departure: {
        title: "마지막 간식 · 공항 이동",
        description: "난바나 우메다 역 주변에서 기념 간식과 가벼운 식사를 정리하고 간사이공항으로 이동해요.",
        tags: ["departure", "food"],
      },
    },
  },
  shopping: {
    headline: "우메다와 난바 상권을 중심으로 쇼핑 시간을 넉넉히 둔 일정이에요.",
    description: "백화점, 드럭스토어, 소품샵, 오렌지스트리트를 날짜별로 분산합니다.",
    days: {
      arrival: {
        title: "도착 · 난바 쇼핑",
        description: "체크인 후 난바와 도톤보리 주변에서 드럭스토어와 소품샵을 가볍게 보고 저녁 식사까지 연결해요.",
        tags: ["shopping", "namba"],
      },
      main: {
        title: "우메다 백화점 · 전망",
        description: "우메다 백화점과 대형 쇼핑몰을 집중적으로 둘러보고, 저녁에는 공중정원이나 나카노시마 전망 동선으로 쉬어가요.",
        tags: ["shopping", "umeda"],
      },
      nearby: {
        title: "신사이바시 · 오렌지스트리트",
        description: "신사이바시와 오렌지스트리트 편집숍을 보고, 난바로 내려와 캐릭터샵과 드럭스토어 쇼핑을 이어가요.",
        tags: ["shopping", "shinsaibashi"],
      },
      extra: {
        title: "덴노지 · 마지막 쇼핑",
        description: "덴노지나 우메다 중 숙소와 가까운 상권을 골라 짐 정리 부담이 적은 마지막 쇼핑일로 구성해요.",
        tags: ["shopping", "tennoji"],
      },
      departure: {
        title: "역 주변 쇼핑 · 공항",
        description: "출국 전 역 주변 상권에서 기념품과 드럭스토어 품목을 정리하고 간사이공항으로 이동해요.",
        tags: ["departure", "shopping"],
      },
    },
  },
  sightseeing: {
    headline: "오사카 대표 명소와 가까운 근교 선택지를 균형 있게 넣은 일정이에요.",
    description: "오사카성, 우메다, 신세카이, 교토·나라·고베 후보를 일정 강도에 맞춥니다.",
    days: {
      arrival: {
        title: "도착 · 난바 야경",
        description: "숙소 체크인 후 난바와 도톤보리 야경을 가볍게 보고, 첫날은 이동 부담을 낮춰 오사카 분위기에 적응해요.",
        tags: ["sightseeing", "minami"],
      },
      main: {
        title: "오사카성 · 우메다",
        description: "낮에는 오사카성과 주변 공원을 보고, 오후에는 우메다 전망대와 나카노시마 동선으로 대표 명소를 연결해요.",
        tags: ["sightseeing", "history"],
      },
      nearby: {
        title: "교토·나라 중 하루",
        description: "교토, 나라, 고베 중 한 곳만 골라 당일 코스로 다녀오고, 늦은 저녁은 난바나 우메다로 돌아와 쉬어요.",
        tags: ["nearby", "sightseeing"],
      },
      extra: {
        title: "신세카이 · 덴노지",
        description: "신세카이와 츠텐카쿠, 덴노지를 묶어 오사카다운 분위기를 보고 마지막 밤은 도톤보리 산책으로 마무리해요.",
        tags: ["sightseeing", "tennoji"],
      },
      departure: {
        title: "숙소 주변 정리 · 공항",
        description: "출국 전 숙소 주변에서 짧은 식사와 쇼핑을 마치고 간사이공항으로 이동해요.",
        tags: ["departure"],
      },
    },
  },
  family: {
    headline: "가족 여행에 맞춰 이동 부담이 적고 휴식 시간이 있는 일정이에요.",
    description: "실내형 명소, 공원, 이른 복귀를 우선해 컨디션을 지키는 흐름입니다.",
    days: {
      arrival: {
        title: "도착 · 숙소 주변 적응",
        description: "공항 이동 후 숙소 체크인, 아이와 함께 숙소 근처에서 가볍게 식사하고 일찍 쉬어요.",
        tags: ["family", "arrival"],
      },
      main: {
        title: "가이유칸 · 덴포잔",
        description: "수족관과 덴포잔처럼 이동 부담이 적은 실내형 명소를 중심으로 하루를 구성하고, 저녁은 숙소 근처로 돌아와요.",
        tags: ["family", "indoor"],
      },
      nearby: {
        title: "오사카성공원 · 휴식",
        description: "오사카성공원처럼 걷기 편한 장소를 짧게 보고, 오후에는 카페나 숙소 휴식 시간을 확보해요.",
        tags: ["family", "park"],
      },
      extra: {
        title: "실내 명소 · 이른 복귀",
        description: "날씨와 컨디션에 맞춰 실내형 명소나 쇼핑몰을 선택하고, 저녁에는 무리하지 않고 숙소로 일찍 돌아와요.",
        tags: ["family", "rest"],
      },
      departure: {
        title: "가벼운 아침 · 공항",
        description: "출국 전 무리한 동선 없이 숙소 주변에서 아침 식사를 하고 간사이공항으로 이동해요.",
        tags: ["departure", "family"],
      },
    },
  },
  onsen: {
    headline: "온천과 휴식 성향을 반영해 관광보다 컨디션 회복 시간을 둔 일정이에요.",
    description: "오사카에서는 대욕장 숙소, 스파월드, 소라니와 온천 같은 휴식 옵션을 활용합니다.",
    days: {
      arrival: {
        title: "도착 · 대욕장 숙소",
        description: "체크인 후 난바나 우메다에서 짧게 식사하고, 대욕장이나 스파가 있는 숙소에서 이동 피로를 풀어요.",
        tags: ["onsen", "hotel"],
      },
      main: {
        title: "스파월드 · 시내 산책",
        description: "스파월드나 소라니와 온천 후보를 중심으로 휴식 시간을 확보하고, 신세카이나 난바 산책은 짧게 더해요.",
        tags: ["onsen", "spa"],
      },
      nearby: {
        title: "아리마 또는 여유 관광",
        description: "이동 여유가 있으면 아리마 온천을 검토하고, 부담스럽다면 우메다 전망과 대욕장 숙소 체류로 조정해요.",
        tags: ["onsen", "nearby"],
      },
      extra: {
        title: "대욕장 · 느린 하루",
        description: "관광지를 많이 넣기보다 카페와 짧은 쇼핑, 숙소 휴식 시간을 나누어 여행 후반 컨디션을 맞춰요.",
        tags: ["onsen", "rest"],
      },
      departure: {
        title: "체크아웃 · 공항 이동",
        description: "출국 전 무리한 관광 없이 숙소 주변에서 가볍게 식사하고 간사이공항으로 이동해요.",
        tags: ["departure", "onsen"],
      },
    },
  },
  couple: {
    headline: "커플 여행에 맞춰 야경, 카페, 강변 산책을 자연스럽게 넣은 일정이에요.",
    description: "나카노시마, 우메다 전망, 도톤보리 야경처럼 분위기 있는 시간을 확보합니다.",
    days: {
      arrival: {
        title: "도착 · 도톤보리 야경",
        description: "체크인 후 도톤보리 강변과 난바 골목을 가볍게 산책하고, 분위기 좋은 저녁 식사로 시작해요.",
        tags: ["couple", "night"],
      },
      main: {
        title: "나카노시마 · 우메다 전망",
        description: "낮에는 나카노시마와 카페 동선을 걷고, 저녁에는 우메다 전망대나 공중정원 야경으로 이어가요.",
        tags: ["couple", "umeda"],
      },
      nearby: {
        title: "고베 또는 감성 골목",
        description: "하루는 고베 산책이나 오사카 감성 골목을 선택해 사진과 카페 시간을 충분히 확보해요.",
        tags: ["couple", "nearby"],
      },
      extra: {
        title: "리버크루즈 · 카페",
        description: "도톤보리 리버크루즈나 카페, 소품샵을 여유롭게 묶고 마지막 밤은 야경 산책으로 마무리해요.",
        tags: ["couple", "cruise"],
      },
      departure: {
        title: "브런치 · 공항 이동",
        description: "숙소 근처에서 브런치나 카페 시간을 짧게 갖고 간사이공항으로 이동해요.",
        tags: ["departure", "couple"],
      },
    },
  },
  solo: {
    headline: "혼자 여행에 맞춰 이동이 쉽고 자유도가 높은 동선으로 구성했어요.",
    description: "난바, 우라난바, 시장, 카페처럼 혼자 움직이기 쉬운 구간을 우선합니다.",
    days: {
      arrival: {
        title: "도착 · 난바 자유 산책",
        description: "숙소 체크인 후 난바와 도톤보리 주변을 가볍게 걸으며 혼밥하기 쉬운 식당이나 카페를 찾아요.",
        tags: ["solo", "namba"],
      },
      main: {
        title: "시장 · 카페 · 서점",
        description: "구로몬시장, 우라난바, 카페와 서점 동선을 자유롭게 이어가며 혼자 속도에 맞춰 움직여요.",
        tags: ["solo", "food"],
      },
      nearby: {
        title: "나라 반나절 · 자유시간",
        description: "나라를 반나절 다녀오거나 시내 패스 코스로 바꾸기 쉬운 하루로 잡고, 저녁은 텐마나 우메다에서 자유롭게 보내요.",
        tags: ["solo", "nearby"],
      },
      extra: {
        title: "우메다 · 소품샵 탐색",
        description: "우메다와 신사이바시의 카페, 소품샵, 쇼핑몰을 부담 없이 오가며 마지막 자유시간을 넉넉히 둬요.",
        tags: ["solo", "shopping"],
      },
      departure: {
        title: "역세권 정리 · 공항",
        description: "짐 보관이 쉬운 역세권에서 간단한 식사와 쇼핑을 마치고 간사이공항으로 이동해요.",
        tags: ["departure", "solo"],
      },
    },
  },
};

const FUKUOKA_PLANS: Record<TravelStyle, StylePlan> = {
  food: {
    headline: "하카타와 텐진을 중심으로 식도락과 야타이 시간을 넉넉히 둔 일정이에요.",
    description: "라멘, 모츠나베, 야타이, 시장, 카페를 하루 역할에 맞춰 나눕니다.",
    days: {
      arrival: {
        title: "도착 · 하카타 라멘",
        description: "하카타 체크인 후 라멘이나 모츠나베로 시작하고, 밤에는 나카스 야타이 분위기를 가볍게 즐겨요.",
        tags: ["food", "hakata"],
      },
      main: {
        title: "텐진 · 다이묘 카페",
        description: "텐진 상권과 다이묘, 이마이즈미 카페를 이어가며 점심부터 저녁까지 식도락 시간을 넉넉히 둬요.",
        tags: ["food", "tenjin"],
      },
      nearby: {
        title: "다자이후 · 로컬 간식",
        description: "다자이후를 반나절 다녀오며 우메가에모치 같은 로컬 간식과 근교 분위기를 함께 즐겨요.",
        tags: ["food", "dazaifu"],
      },
      extra: {
        title: "야나기바시 · 야타이",
        description: "야나기바시 시장과 하카타역 주변 맛집을 보고, 마지막 밤은 나카스 야타이나 이자카야 동선으로 마무리해요.",
        tags: ["food", "market"],
      },
      departure: {
        title: "하카타역 간식 · 공항",
        description: "하카타역에서 기념 간식과 도시락을 정리하고 후쿠오카공항으로 이동해요.",
        tags: ["departure", "food"],
      },
    },
  },
  shopping: {
    headline: "텐진과 하카타역 상권을 중심으로 쇼핑 시간을 충분히 둔 일정이에요.",
    description: "백화점, 캐널시티, 다이묘 편집숍, 드럭스토어를 날짜별로 나눕니다.",
    days: {
      arrival: {
        title: "도착 · 하카타역 상권",
        description: "체크인 후 하카타역 쇼핑몰과 기념품 코너를 가볍게 보고, 숙소 주변에서 저녁을 해결해요.",
        tags: ["shopping", "hakata"],
      },
      main: {
        title: "텐진 백화점 · 다이묘",
        description: "텐진 백화점과 지하상가를 둘러보고, 다이묘 편집숍과 카페 동선으로 이어가요.",
        tags: ["shopping", "tenjin"],
      },
      nearby: {
        title: "캐널시티 · 나카스",
        description: "캐널시티와 나카스 주변을 묶어 쇼핑과 식사를 함께 처리하고, 밤에는 이동이 짧은 동선으로 마무리해요.",
        tags: ["shopping", "canalcity"],
      },
      extra: {
        title: "텐진 · 마지막 쇼핑",
        description: "드럭스토어, 백화점 식품관, 기념품을 정리하고 짐 부담을 고려해 숙소와 가까운 상권에 집중해요.",
        tags: ["shopping", "last"],
      },
      departure: {
        title: "하카타역 정리 · 공항",
        description: "하카타역 주변에서 마지막 쇼핑과 간단한 식사를 마치고 후쿠오카공항으로 이동해요.",
        tags: ["departure", "shopping"],
      },
    },
  },
  sightseeing: {
    headline: "후쿠오카 대표 명소와 가까운 근교를 균형 있게 넣은 일정이에요.",
    description: "오호리공원, 모모치, 다자이후, 하카타·텐진을 무리 없이 연결합니다.",
    days: {
      arrival: {
        title: "도착 · 하카타와 나카스",
        description: "체크인 후 하카타와 나카스 주변을 가볍게 걸으며 후쿠오카 첫날 분위기에 적응해요.",
        tags: ["sightseeing", "core"],
      },
      main: {
        title: "오호리 · 모모치 해변",
        description: "오호리공원과 모모치해변, 후쿠오카타워를 묶어 시내 대표 명소를 여유 있게 둘러봐요.",
        tags: ["sightseeing", "seaside"],
      },
      nearby: {
        title: "다자이후 반나절",
        description: "다자이후를 반나절 코스로 다녀오고, 오후에는 텐진이나 하카타에서 식사와 쇼핑 시간을 확보해요.",
        tags: ["sightseeing", "dazaifu"],
      },
      extra: {
        title: "야나가와 또는 시내 보강",
        description: "야나가와나 다자이후 추가 동선을 선택하거나, 시내 명소와 카페 시간을 보강하는 하루로 구성해요.",
        tags: ["sightseeing", "nearby"],
      },
      departure: {
        title: "하카타역 마무리 · 공항",
        description: "출국 전 하카타역 주변에서 기념품과 식사를 정리하고 후쿠오카공항으로 이동해요.",
        tags: ["departure"],
      },
    },
  },
  family: {
    headline: "가족 여행에 맞춰 이동 부담이 적고 공원·실내형 시간을 둔 일정이에요.",
    description: "오호리공원, 모모치, 마린월드 후보를 컨디션에 맞춰 배치합니다.",
    days: {
      arrival: {
        title: "도착 · 숙소 주변 적응",
        description: "공항에서 숙소로 이동한 뒤 하카타나 텐진 주변에서 짧게 식사하고 아이 컨디션을 우선해 쉬어요.",
        tags: ["family", "arrival"],
      },
      main: {
        title: "오호리공원 · 모모치",
        description: "오호리공원과 모모치해변처럼 걷기 편한 장소를 중심으로 이동 부담이 적은 하루를 만들어요.",
        tags: ["family", "park"],
      },
      nearby: {
        title: "마린월드 또는 실내 코스",
        description: "마린월드나 우미노나카미치 계열 코스를 선택하고, 날씨가 좋지 않으면 하카타·텐진 실내 동선으로 바꿔요.",
        tags: ["family", "indoor"],
      },
      extra: {
        title: "짧은 근교 · 이른 복귀",
        description: "다자이후처럼 이동이 비교적 쉬운 근교를 짧게 다녀오고, 저녁은 숙소 근처에서 마무리해요.",
        tags: ["family", "dazaifu"],
      },
      departure: {
        title: "가벼운 아침 · 공항",
        description: "출국 전 무리한 이동 없이 숙소 주변에서 식사하고 후쿠오카공항으로 이동해요.",
        tags: ["departure", "family"],
      },
    },
  },
  onsen: {
    headline: "온천과 휴식 성향을 반영해 시내와 근교 휴식을 나누어 구성했어요.",
    description: "대욕장 숙소, 다자이후, 유후인·벳푸 후보를 일정 길이에 맞춰 배치합니다.",
    days: {
      arrival: {
        title: "도착 · 대욕장 숙소",
        description: "체크인 후 하카타나 텐진에서 가볍게 식사하고, 대욕장 숙소나 스파 시간을 확보해 이동 피로를 풀어요.",
        tags: ["onsen", "hotel"],
      },
      main: {
        title: "시내 여유 · 대욕장",
        description: "오호리공원이나 텐진을 짧게 보고, 오후에는 숙소 대욕장과 휴식 시간을 넉넉히 남겨요.",
        tags: ["onsen", "rest"],
      },
      nearby: {
        title: "유후인 또는 벳푸 온천",
        description: "하루는 유후인이나 벳푸 온천 코스로 잡아 이동 시간을 감안하고 온천 휴식 시간을 충분히 가져가요.",
        tags: ["onsen", "yufuin"],
      },
      extra: {
        title: "다자이후 · 느린 산책",
        description: "다자이후를 여유롭게 다녀오고, 저녁에는 하카타나 텐진으로 돌아와 가벼운 식사와 휴식을 이어가요.",
        tags: ["onsen", "dazaifu"],
      },
      departure: {
        title: "하카타역 마무리 · 공항",
        description: "출국 전 하카타역 주변에서 기념품을 정리하고 후쿠오카공항으로 이동해요.",
        tags: ["departure", "onsen"],
      },
    },
  },
  couple: {
    headline: "커플 여행에 맞춰 해변, 카페, 야경이 자연스럽게 이어지는 일정이에요.",
    description: "모모치해변, 후쿠오카타워, 나카스 야경, 이토시마 후보를 분위기 있게 나눕니다.",
    days: {
      arrival: {
        title: "도착 · 텐진과 나카스 야경",
        description: "체크인 후 텐진이나 나카스 주변에서 가볍게 저녁을 먹고 야경 산책을 즐겨요.",
        tags: ["couple", "night"],
      },
      main: {
        title: "모모치 해변 · 카페",
        description: "오호리공원과 모모치해변을 여유롭게 둘러보고, 후쿠오카타워와 분위기 좋은 카페 시간을 확보해요.",
        tags: ["couple", "seaside"],
      },
      nearby: {
        title: "이토시마 감성 코스",
        description: "이토시마 해변과 카페, 사진 포인트를 중심으로 시내와 다른 분위기의 하루를 만들어요.",
        tags: ["couple", "itoshima"],
      },
      extra: {
        title: "다자이후 · 감성 산책",
        description: "다자이후를 여유롭게 다녀오고, 저녁에는 텐진으로 돌아와 가벼운 쇼핑이나 식사를 해요.",
        tags: ["couple", "dazaifu"],
      },
      departure: {
        title: "하카타역 브런치 · 공항",
        description: "출국 전 하카타역 주변에서 브런치나 기념품 쇼핑을 짧게 하고 후쿠오카공항으로 이동해요.",
        tags: ["departure", "couple"],
      },
    },
  },
  solo: {
    headline: "혼자 여행에 맞춰 역세권과 카페, 시장을 자유롭게 오가는 일정이에요.",
    description: "하카타, 텐진, 오호리공원, 야타이를 혼자 이동하기 쉬운 순서로 배치합니다.",
    days: {
      arrival: {
        title: "도착 · 하카타 자유 산책",
        description: "하카타 체크인 후 역 주변과 라멘 골목을 가볍게 둘러보고, 혼자 들어가기 쉬운 식당에서 첫날을 시작해요.",
        tags: ["solo", "hakata"],
      },
      main: {
        title: "텐진 · 오호리 카페",
        description: "텐진 상권과 오호리공원, 카페를 자유롭게 오가며 혼자 속도에 맞는 하루를 보내요.",
        tags: ["solo", "cafe"],
      },
      nearby: {
        title: "다자이후 반나절",
        description: "다자이후를 반나절 다녀오고, 오후에는 하카타나 텐진에서 시장과 카페 시간을 남겨요.",
        tags: ["solo", "dazaifu"],
      },
      extra: {
        title: "야나기바시 · 야타이",
        description: "야나기바시 시장과 나카스 야타이처럼 혼자 걷기 쉬운 식도락 동선을 중심으로 마지막 밤을 보내요.",
        tags: ["solo", "food"],
      },
      departure: {
        title: "역세권 정리 · 공항",
        description: "하카타역에서 짐과 기념품을 정리하고 후쿠오카공항으로 이동해요.",
        tags: ["departure", "solo"],
      },
    },
  },
};

function cityPlans(city: City) {
  return city === "fukuoka" ? FUKUOKA_PLANS : OSAKA_PLANS;
}

function roleFor(day: number, days: number): DayRole {
  if (day === 1) return "arrival";
  if (day === days) return "departure";
  if (days === 2) return day === 1 ? "arrival" : "departure";
  if (days === 3) return day === 2 ? "main" : "departure";
  if (days === 4) return day === 2 ? "main" : day === 3 ? "nearby" : "departure";
  return day === 2 ? "main" : day === 3 ? "nearby" : day === 4 ? "extra" : "departure";
}

export function createItineraryOutline(input: ItineraryTemplateInput): ItineraryTemplateResult {
  const days = clampDays(Math.min(5, input.days || input.nights + 1));
  const primaryStyle = normalizeTravelStyle(input.primaryStyle) ?? "sightseeing";
  const secondaryStyle =
    normalizeTravelStyle(input.secondaryStyle) && normalizeTravelStyle(input.secondaryStyle) !== primaryStyle
      ? normalizeTravelStyle(input.secondaryStyle)
      : undefined;
  const plan = cityPlans(input.city)[primaryStyle];
  const headline = secondaryStyle
    ? `${STYLE_LABEL[primaryStyle]}·${STYLE_LABEL[secondaryStyle]} 성향을 반영해 ${plan.description.replace(/합니다\.$/, "해요.").replace(/입니다\.$/, "이에요.")}`
    : plan.headline;
  const outline = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const role = roleFor(day, days);
    const copy = role === "departure" ? plan.days.departure : withSecondary(plan.days[role], input.city, secondaryStyle);
    return {
      day,
      title: copy.title,
      description: copy.description,
      tags: copy.tags,
    };
  });

  return {
    headline,
    description: secondaryStyle ? `${plan.description} ${secondaryPhrase(input.city, secondaryStyle)}` : plan.description,
    days: outline,
  };
}
