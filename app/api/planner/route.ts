import { NextRequest, NextResponse } from 'next/server';
import { searchTnaProductsViaApi, type TnaSearchItem } from '@/src/lib/myrealtrip';

const MRT_MCP_URL = 'https://mcp-servers.myrealtrip.com/mcp';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store, max-age=0',
};

const SUFFICIENT_STAY_CANDIDATE_COUNT = 20;
const HOTEL_KEYWORD_TIMEOUT_MS = 1800;
const HOTEL_KEYWORD_TIMEOUT = Symbol('HOTEL_KEYWORD_TIMEOUT');

type PlannerTimingMeta = Record<string, string | number | boolean | null | undefined>;
type PlannerTimer = {
  mark: (step: string, meta?: PlannerTimingMeta) => void;
};

function createPlannerTimer(enabled: boolean): PlannerTimer {
  if (!enabled) {
    return { mark: () => undefined };
  }

  const start = typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
  const now = () => (
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()
  );
  const formatMeta = (meta?: PlannerTimingMeta) => {
    if (!meta) return '';
    const entries = Object.entries(meta)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${String(value)}`);
    return entries.length ? ` (${entries.join(', ')})` : '';
  };
  return {
    mark(step, meta) {
      const elapsed = Math.round((now() - start) * 10) / 10;
      console.log(`[api/planner] ${step}: ${elapsed}ms${formatMeta(meta)}`);
    },
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | typeof HOTEL_KEYWORD_TIMEOUT> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<typeof HOTEL_KEYWORD_TIMEOUT>((resolve) => {
    timeoutId = setTimeout(() => resolve(HOTEL_KEYWORD_TIMEOUT), timeoutMs);
  });
  return Promise.race([
    promise.finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    }),
    timeoutPromise,
  ]);
}

async function callMrtMcp(toolName: string, args: Record<string, unknown>) {
  const body = JSON.stringify({
    jsonrpc: '2.0', id: Date.now(), method: 'tools/call',
    params: { name: toolName, arguments: args },
  });
  const res = await fetch(MRT_MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
    body,
  });
  const json = await res.json() as { result?: { content?: { text?: string }[] } };
  const text = json.result?.content?.[0]?.text;
  return text ? JSON.parse(text) : null;
}

// ── Flights ──────────────────────────────────────────────────────────────────
interface FlightItem {
  airline?: { name?: string; code?: string; logoUrl?: string };
  legs?: Array<{
    legIndex?: number; isDirect?: boolean; durationMinutes?: number;
    departDate?: string; departTime?: string; arriveDate?: string; arriveTime?: string;
    segments?: Array<{ departure?: { cityCode?: string }; arrival?: { cityCode?: string } }>;
  }>;
  price?: { total?: number };
  isCheapest?: boolean;
  reservationUrl?: string;
}

function fixReservationUrl(url: string, airCode: string, outDep?: string, outArr?: string, retDep?: string, retArr?: string): string {
  if (!url) return url;
  const origAir = decodeURIComponent(url.match(/[?&]air=([^&]+)/)?.[1] ?? '').split(',')[0];
  const airMismatch = origAir && origAir !== airCode;
  let u = url;
  if (airCode) u = u.replace(/(?<=\?|&)air=[^&]+/, `air=${airCode}%2C${airCode}`);
  if (outDep && retDep) u = u.replace(/(?<=\?|&)dtm=[^&]+/, `dtm=${outDep}%2C${retDep}`);
  if (outArr && retArr) u = u.replace(/(?<=\?|&)atm=[^&]+/, `atm=${outArr}%2C${retArr}`);
  if (airMismatch) u = u.replace(/[?&]fgtno=[^&]*/g, '').replace(/[?&]itno=[^&]*/g, '').replace(/[?&]sno=[^&]*/g, '');
  return u;
}

function parseFlights(data: Record<string, unknown> | null) {
  const items: FlightItem[] = (data as { result?: { items?: FlightItem[] } })?.result?.items ?? [];
  const fmt = (t?: string) => t ? `${t.substring(0, 2)}:${t.substring(2)}` : '';
  const filtered = items.filter(item =>
    item.legs?.some(l => l.legIndex === 2) || (item.legs?.length ?? 0) > 1
  );
  return filtered
  .map((item) => {
    const out = item.legs?.find(l => l.legIndex === 1) ?? item.legs?.[0];
    const ret = item.legs?.find(l => l.legIndex === 2) ?? item.legs?.[1];
    const airCode = item.airline?.code ?? '';
    const fixedUrl = fixReservationUrl(
      item.reservationUrl ?? '',
      airCode,
      out?.departTime, out?.arriveTime,
      ret?.departTime, ret?.arriveTime,
    );
    return {
      airline: item.airline?.name ?? '',
      airlineCode: airCode,
      logoUrl: item.airline?.logoUrl ?? '',
      isDirect: out?.isDirect ?? true,
      isCheapest: item.isCheapest ?? false,
      price: item.price?.total ?? 0,
      reservationUrl: fixedUrl,
      outbound: {
        date: out?.departDate ?? '',
        departTime: fmt(out?.departTime),
        arriveTime: fmt(out?.arriveTime),
        duration: out?.durationMinutes ?? 0,
        origin: out?.segments?.[0]?.departure?.cityCode ?? 'ICN',
        destination: out?.segments?.[0]?.arrival?.cityCode ?? '',
      },
      inbound: ret ? {
        date: ret.departDate ?? '',
        departTime: fmt(ret.departTime),
        arriveTime: fmt(ret.arriveTime),
        duration: ret.durationMinutes ?? 0,
        origin: ret.segments?.[0]?.departure?.cityCode ?? '',
        destination: ret.segments?.[0]?.arrival?.cityCode ?? 'ICN',
      } : null,
    };
  })
  .filter((item) => item.price > 0)
  .sort((a, b) => a.price - b.price)
  .slice(0, 30)
  .map((item, index) => ({ ...item, isCheapest: index === 0 }));
}

// ── Stays ────────────────────────────────────────────────────────────────────
type WidgetNode = {
  type?: string; value?: unknown; src?: string; weight?: string;
  label?: string; url?: string; onClickAction?: { url?: string };
  children?: WidgetNode[];
};

function findListViewItems(node: WidgetNode, out: WidgetNode[] = []): WidgetNode[] {
  if (!node) return out;
  if (node.type === 'ListViewItem') { out.push(node); return out; }
  node.children?.forEach(c => findListViewItems(c, out));
  return out;
}

function extractFromItem(item: WidgetNode) {
  let name = '', img = '', rating = '', reviewCount = '', price = '', bookUrl = '';
  function walk(n: WidgetNode) {
    if (!n) return;
    if (n.type === 'Image' && n.src && !img) img = n.src;
    if (n.type === 'Text' && n.weight === 'bold' && !name) name = String(n.value ?? '');
    if (n.type === 'Text' && String(n.value ?? '').includes('원/박')) price = String(n.value);
    if (n.type === 'Text' && String(n.value ?? '').includes('원~')) price = String(n.value);
    if (n.type === 'Text' && String(n.value ?? '').includes('⭐')) {
      const m = String(n.value).match(/([\d.]+)\s*\(([^)]+)\)/);
      if (m) { rating = m[1]; reviewCount = m[2]; }
    }
    if (n.type === 'Button' && n.onClickAction?.url) bookUrl = n.onClickAction.url;
    n.children?.forEach(walk);
  }
  walk(item);
  const gidMatch = bookUrl.match(/products\/(\d+)/);
  const gid = gidMatch?.[1] ?? '';
  const isBookable = Boolean(gid && bookUrl);
  return {
    name,
    img,
    imageUrl: img,
    rating,
    reviewCount,
    price,
    bookUrl,
    detailUrl: bookUrl,
    affiliateUrl: bookUrl,
    gid,
    productId: gid,
    source: 'api',
    isBookable,
  };
}

function parseStays(data: Record<string, unknown> | null) {
  const widget = (data as { widget?: WidgetNode })?.widget;
  if (!widget) return [];
  return findListViewItems(widget).slice(0, 30).map(extractFromItem);
}

function staySearchKeywords(cityCode: string, cityKeyword: string) {
  if (cityCode !== 'KIX') {
    return [
      cityKeyword,
      'Fukuoka',
      'Hakata',
      'Tenjin',
      'Nakasu',
    ];
  }
  return [
    cityKeyword,
    'Osaka',
    'Namba',
    'Umeda',
    'Shinsaibashi',
    'Dotonbori',
    'Tennoji',
    'Honmachi',
    'Osaka onsen hotel',
    'Osaka family hotel',
  ];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchStaysAcrossKeywords({
  cityCode,
  cityKeyword,
  date,
  returnDate,
  adults,
  children,
  timer,
}: {
  cityCode: string;
  cityKeyword: string;
  date: string;
  returnDate: string;
  adults: number;
  children: number;
  timer?: PlannerTimer;
}) {
  const keywords = staySearchKeywords(cityCode, cityKeyword);
  const deduped = new Map<string, ReturnType<typeof extractFromItem> & { searchKeyword?: string }>();
  const errors: string[] = [];
  const batchSize = 3;
  timer?.mark('hotel search keywords prepared', {
    keywordCount: keywords.length,
    batchSize,
    earlyStopAt: SUFFICIENT_STAY_CANDIDATE_COUNT,
  });

  for (let index = 0; index < keywords.length; index += batchSize) {
    const batch = keywords.slice(index, index + batchSize);
    const batchNumber = Math.floor(index / batchSize) + 1;
    timer?.mark('hotel search batch start', { batch: batchNumber, keywordCount: batch.length });
    const settled = await Promise.allSettled(batch.map(async (keyword) => {
      let parsed: ReturnType<typeof extractFromItem>[] = [];
      for (let attempt = 0; attempt < 2; attempt += 1) {
        timer?.mark('hotel keyword start', { keyword, attempt: attempt + 1 });
        const data = await withTimeout(
          callMrtMcp('searchStays', {
            keyword,
            checkIn: date,
            checkOut: returnDate,
            adultCount: adults,
            childCount: children,
          }),
          HOTEL_KEYWORD_TIMEOUT_MS,
        );
        if (data === HOTEL_KEYWORD_TIMEOUT) {
          timer?.mark('hotel keyword timeout', {
            keyword,
            attempt: attempt + 1,
            timeoutMs: HOTEL_KEYWORD_TIMEOUT_MS,
          });
          break;
        }
        parsed = parseStays(data as Record<string, unknown>);
        timer?.mark('hotel keyword end', { keyword, attempt: attempt + 1, parsed: parsed.length });
        if (parsed.length) break;
        await sleep(120);
      }
      return parsed.map((item) => ({ ...item, searchKeyword: keyword }));
    }));

    for (const result of settled) {
      if (result.status === 'rejected') {
        errors.push(String(result.reason));
        continue;
      }
      for (const stay of result.value) {
        const key = stay.productId || stay.gid || stay.detailUrl || stay.bookUrl || stay.name;
        if (!key || deduped.has(key)) continue;
        deduped.set(key, stay);
      }
    }
    timer?.mark('hotel search batch end', { batch: batchNumber, candidateCount: deduped.size });
    if (deduped.size >= SUFFICIENT_STAY_CANDIDATE_COUNT) {
      timer?.mark('hotel search early stop', {
        batch: batchNumber,
        candidateCount: deduped.size,
        threshold: SUFFICIENT_STAY_CANDIDATE_COUNT,
      });
      break;
    }
  }
  return {
    stays: [...deduped.values()],
    keywords,
    candidateCount: [...deduped.values()].length,
    errors: errors.slice(0, 3),
  };
}

// ── TNAs ─────────────────────────────────────────────────────────────────────
// Kept temporarily as a fallback parser while the planner migrates from MCP to REST.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseTnas(data: Record<string, unknown> | null) {
  const widget = (data as { widget?: WidgetNode })?.widget;
  if (!widget) return [];
  return findListViewItems(widget).slice(0, 6).map(item => {
    const base = extractFromItem(item);
    let tag = '';
    function findBadge(n: WidgetNode) {
      if (n.type === 'Badge' && n.label) tag = n.label;
      n.children?.forEach(findBadge);
    }
    findBadge(item);
    return { ...base, tag };
  });
}

function toPlannerTna(item: TnaSearchItem) {
  return {
    name: item.itemName,
    title: item.itemName,
    img: item.imageUrl ?? '',
    rating: item.reviewScore ? String(item.reviewScore) : '',
    reviewCount: item.reviewCount ? String(item.reviewCount) : '',
    price: item.priceDisplay,
    bookUrl: item.productUrl,
    productUrl: item.productUrl,
    url: item.productUrl,
    deepLink: item.deepLink ?? '',
    gid: item.gid,
    tag: item.category ?? '',
    category: item.category ?? '',
    tags: item.tags ?? [],
    source: 'myrealtrip',
  };
}

function hasUsableTnaUrl(item: TnaSearchItem) {
  const url = String(item.productUrl || item.deepLink || '').trim();
  return Boolean(url) && !/undefined|null|#/.test(url);
}

function sampleTnaKeywords(options: {
  cityCode: string;
  recommendedExtras?: string;
  templateTitle?: string;
  routeStyle?: string;
  planType?: string;
}) {
  const text = `${options.recommendedExtras || ''} ${options.templateTitle || ''} ${options.routeStyle || ''} ${options.planType || ''}`.toLowerCase();
  if (options.cityCode === 'FUK') {
    if (text.includes('onsen') || text.includes('온천')) {
      return ['유후인 벳푸 투어', '산큐패스', '일본 eSIM'];
    }
    return ['후쿠오카 지하철 1일권', '산큐패스', '일본 eSIM'];
  }
  if (text.includes('standard') || text.includes('표준')) {
    return ['오사카 주유패스', '유니버설 스튜디오 재팬', '일본 eSIM'];
  }
  return ['오사카 주유패스', '라피트', '일본 eSIM'];
}

async function searchPlannerTnas(options: {
  cityCode: string;
  cityKeyword: string;
  recommendedExtras?: string;
  templateTitle?: string;
  routeStyle?: string;
  planType?: string;
  timer?: PlannerTimer;
}) {
  const keywords = sampleTnaKeywords(options);
  options.timer?.mark('tour search keywords prepared', { keywordCount: keywords.length });
  const results = await Promise.allSettled(
    keywords.map(async (keyword) => {
      options.timer?.mark('tour keyword start', { keyword });
      const result = await searchTnaProductsViaApi({
        keyword,
        city: options.cityKeyword,
        category: 'all',
        sort: 'selling_count_desc',
        page: 1,
        perPage: 4,
      });
      options.timer?.mark('tour keyword end', {
        keyword,
        ok: result.ok,
        itemCount: result.ok ? result.data.items.length : 0,
      });
      return result;
    }),
  );
  options.timer?.mark('tour normalize start');
  const seen = new Set<string>();
  const items: TnaSearchItem[] = [];
  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value.ok) continue;
    for (const item of result.value.data.items) {
      const key = item.gid || item.productUrl || item.itemName;
      if (!key || seen.has(key) || !hasUsableTnaUrl(item)) continue;
      seen.add(key);
      items.push(item);
    }
  }
  options.timer?.mark('tour normalize end', { candidateCount: items.length });
  return items.slice(0, 9);
}

function getFallbackTnas(cityCode: string) {
  const curated = cityCode === 'FUK'
    ? [
        {
          name: '유후인·벳부 온천 데이투어',
          img: '',
          rating: '4.8',
          reviewCount: '320',
          price: '성인 89,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-fukuoka-onsen',
          tag: '온천',
        },
        {
          name: '다자이후·야나가와 대표 근교 투어',
          img: '',
          rating: '4.7',
          reviewCount: '280',
          price: '성인 59,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-fukuoka-nearby',
          tag: '근교 관광',
        },
        {
          name: '하카타·텐진 맛집 산책',
          img: '',
          rating: '4.6',
          reviewCount: '210',
          price: '성인 39,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-fukuoka-food',
          tag: '맛집',
        },
        {
          name: '이토시마 감성 포토 코스',
          img: '',
          rating: '4.7',
          reviewCount: '190',
          price: '성인 69,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-fukuoka-itoshima',
          tag: '커플·관광',
        },
      ]
    : [
        {
          name: '오사카 핵심 시티투어',
          img: '',
          rating: '4.8',
          reviewCount: '1,250',
          price: '성인 59,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-osaka-citytour',
          tag: '관광',
        },
        {
          name: '나라 반나절 근교 투어',
          img: '',
          rating: '4.7',
          reviewCount: '640',
          price: '성인 49,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-osaka-nara',
          tag: '근교 관광',
        },
        {
          name: '구로몬시장·도톤보리 맛집 워크',
          img: '',
          rating: '4.6',
          reviewCount: '360',
          price: '성인 35,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-osaka-food',
          tag: '맛집',
        },
        {
          name: '고베 야경·리버크루즈 코스',
          img: '',
          rating: '4.7',
          reviewCount: '240',
          price: '성인 79,000원~',
          bookUrl: 'https://experiences.myrealtrip.com/',
          gid: 'fallback-osaka-night',
          tag: '야경',
        },
      ];
  return curated;

  if (cityCode === 'FUK') {
    return [
      {
        name: '후쿠오카 근교 온천 데이투어',
        img: '',
        rating: '4.8',
        reviewCount: '320',
        price: '성인 49,000원~',
        bookUrl: 'https://experiences.myrealtrip.com/',
        gid: 'fallback-fukuoka-onsen',
        tag: '근교 투어',
      },
      {
        name: '하카타·텐진 맛집 산책',
        img: '',
        rating: '4.7',
        reviewCount: '210',
        price: '성인 39,000원~',
        bookUrl: 'https://experiences.myrealtrip.com/',
        gid: 'fallback-fukuoka-food',
        tag: '맛집',
      },
    ];
  }

  return [
    {
      name: '오사카 난카이 라피트 왕복 E-티켓',
      img: '',
      rating: '4.8',
      reviewCount: '1,250',
      price: '12,657원~',
      bookUrl: 'https://experiences.myrealtrip.com/products/5869248',
      gid: '5869248',
      tag: '티켓',
    },
    {
      name: '오사카 핵심 시티투어',
      img: '',
      rating: '4.7',
      reviewCount: '640',
      price: '성인 59,000원~',
      bookUrl: 'https://experiences.myrealtrip.com/',
      gid: 'fallback-osaka-citytour',
      tag: '가이드 투어',
    },
  ];
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const timer = createPlannerTimer(p.get('_debugPlanner') === '1');
  timer.mark('request start');
  const cityCode = p.get('cityCode') ?? 'KIX';
  const date     = p.get('date')     ?? '2026-06-24';
  const nights   = parseInt(p.get('nights') ?? '3');
  const origin   = p.get('origin')   ?? 'ICN';
  const adults   = Math.max(1, parseInt(p.get('adults') ?? p.get('adult') ?? '2', 10) || 2);
  const children = Math.max(0, parseInt(p.get('children') ?? p.get('child') ?? '0', 10) || 0);
  const tripTypeParam = p.get('tripType');
  const tripType = tripTypeParam === 'OW' || tripTypeParam === 'ONE_WAY' ? 'ONE_WAY' : 'ROUND_TRIP';
  const requestReturnDate = p.get('returnDate');
  const includeFlight = p.get('includeFlight') !== 'false';
  const includeHotel = p.get('includeHotel') !== 'false';
  const includeTour = p.get('includeTour') !== 'false';
  const recommendedExtras = p.get('recommendedExtras') ?? '';
  const templateTitle = p.get('templateTitle') ?? '';
  const routeStyle = p.get('routeStyle') ?? '';
  const planType = p.get('planType') ?? '';
  const includeSupportTickets = Boolean(recommendedExtras || templateTitle || routeStyle || planType);
  const includeTna = includeTour || includeSupportTickets;

  const d = new Date(date);
  d.setDate(d.getDate() + nights);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const returnDate = requestReturnDate || `${d.getFullYear()}-${mm}-${dd}`;

  const cityKeyword = cityCode === 'KIX' ? '오사카' : '후쿠오카';
  timer.mark('parse params', {
    cityCode,
    nights,
    includeFlight,
    includeHotel,
    includeTour,
    includeTna,
  });
  timer.mark('itinerary build start', { handledIn: 'planner-summary/client' });
  timer.mark('itinerary build end', { skipped: true });
  timer.mark('budget calculation start', { handledIn: 'planner-summary/client' });
  timer.mark('budget calculation end', { skipped: true });

  try {
    const stayPromise = includeHotel
      ? (async () => {
          timer.mark('hotel search start');
          try {
            const result = await searchStaysAcrossKeywords({ cityCode, cityKeyword, date, returnDate, adults, children, timer });
            if (result.candidateCount > 0) {
              timer.mark('hotel search end', { candidateCount: result.candidateCount, retried: false });
              return result;
            }
            timer.mark('hotel search empty retry wait start');
            await sleep(250);
            timer.mark('hotel search empty retry start');
            const retryResult = await searchStaysAcrossKeywords({ cityCode, cityKeyword, date, returnDate, adults, children, timer });
            timer.mark('hotel search end', { candidateCount: retryResult.candidateCount, retried: true });
            return retryResult;
          } catch (error) {
            timer.mark('hotel search end', { error: true });
            throw error;
          }
        })()
      : Promise.resolve({ stays: [], keywords: [], candidateCount: 0, errors: [] });
    const flightPromise = includeFlight ? (async () => {
      timer.mark('flight search start');
      try {
        const result = await callMrtMcp('searchInternationalFlights', {
        origin, destination: cityCode,
        departDate: date,
        returnDate: tripType === 'ROUND_TRIP' ? returnDate : '',
        tripType,
        adult: adults,
        adultCount: adults,
        adults,
        child: children,
        childCount: children,
        children,
        infant: 0,
        infantCount: 0,
        infants: 0,
        passengers: { adult: adults, child: children, infant: 0 },
        maxResults: 50,
        });
        timer.mark('flight search end');
        return result;
      } catch (error) {
        timer.mark('flight search end', { error: true });
        throw error;
      }
    })() : Promise.resolve(null);
    const tnaPromise = includeTna
      ? (async () => {
          timer.mark('tour search start');
          try {
            const result = await searchPlannerTnas({ cityCode, cityKeyword, recommendedExtras, templateTitle, routeStyle, planType, timer });
            timer.mark('tour search end', { candidateCount: result.length });
            return result;
          } catch (error) {
            timer.mark('tour search end', { error: true });
            throw error;
          }
        })()
      : Promise.resolve([]);
    timer.mark('parallel searches await start');
    const [stayResult, flightData, tnaResult] = await Promise.all([
      stayPromise,
      flightPromise,
      tnaPromise,
    ]);
    timer.mark('parallel searches await end');

    timer.mark('result normalize start');
    const flights = includeFlight ? parseFlights(flightData as Record<string, unknown>) : [];
    const stays   = includeHotel ? stayResult.stays : [];
    const liveTnas = includeTna ? tnaResult.map(toPlannerTna) : [];
    const tnas    = includeTna ? (liveTnas.length ? liveTnas : getFallbackTnas(cityCode)) : [];
    timer.mark('result normalize end', {
      flightCount: flights.length,
      stayCount: stays.length,
      tourCount: tnas.length,
    });

    timer.mark('response ready');
    return NextResponse.json(
      { flights, stays, tnas, meta: { date, returnDate, nights, cityCode, cityKeyword, adults, children, tripType, includeFlight, includeHotel, includeTour, includeSupportTickets, includeTna, stayKeywords: stayResult.keywords, stayCandidateCount: stayResult.candidateCount, stayErrors: stayResult.errors } },
      { headers: CORS }
    );
  } catch (err) {
    timer.mark('response fallback start');
    const fallbackTnas = includeTna ? getFallbackTnas(cityCode) : [];
    timer.mark('response ready', { fallback: true });
    return NextResponse.json(
      {
        flights: [],
        stays: [],
        tnas: fallbackTnas,
        meta: { date, returnDate, nights, cityCode, cityKeyword, adults, children, tripType, includeFlight, includeHotel, includeTour, includeSupportTickets, includeTna, fallback: true, error: String(err) },
      },
      { headers: CORS },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { ...CORS, 'Access-Control-Allow-Headers': 'Content-Type' } });
}
