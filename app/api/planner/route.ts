import { NextRequest, NextResponse } from 'next/server';

const MRT_MCP_URL = 'https://mcp-servers.myrealtrip.com/mcp';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };

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
  if (airMismatch) u = u.replace(/(?<=\?|&)fgtno=[^&]+/, 'fgtno=');
  return u;
}

function parseFlights(data: Record<string, unknown> | null) {
  const items: FlightItem[] = (data as { result?: { items?: FlightItem[] } })?.result?.items ?? [];
  const fmt = (t?: string) => t ? `${t.substring(0, 2)}:${t.substring(2)}` : '';
  return items.slice(0, 3).map((item) => {
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
  });
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
  return { name, img, rating, reviewCount, price, bookUrl, gid: gidMatch?.[1] ?? '' };
}

function parseStays(data: Record<string, unknown> | null) {
  const widget = (data as { widget?: WidgetNode })?.widget;
  if (!widget) return [];
  return findListViewItems(widget).slice(0, 3).map(extractFromItem);
}

// ── TNAs ─────────────────────────────────────────────────────────────────────
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

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const cityCode = p.get('cityCode') ?? 'KIX';
  const date     = p.get('date')     ?? '2026-06-24';
  const nights   = parseInt(p.get('nights') ?? '3');
  const origin   = p.get('origin')   ?? 'ICN';

  const d = new Date(date);
  d.setDate(d.getDate() + nights);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const returnDate = `${d.getFullYear()}-${mm}-${dd}`;

  const cityKeyword = cityCode === 'KIX' ? '오사카' : '후쿠오카';

  try {
    const [flightData, stayData, tnaData] = await Promise.all([
      callMrtMcp('searchInternationalFlights', {
        origin, destination: cityCode,
        departDate: date, returnDate, tripType: 'ROUND_TRIP', maxResults: 3,
      }),
      callMrtMcp('searchStays', {
        keyword: cityKeyword, checkIn: date, checkOut: returnDate, adultCount: 2,
      }),
      callMrtMcp('searchTnas', { query: `${cityKeyword} 관광`, perPage: 6 }),
    ]);

    const flights = parseFlights(flightData as Record<string, unknown>);
    const stays   = parseStays(stayData as Record<string, unknown>);
    const tnas    = parseTnas(tnaData as Record<string, unknown>);

    return NextResponse.json(
      { flights, stays, tnas, meta: { date, returnDate, nights, cityCode, cityKeyword } },
      { headers: CORS }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { ...CORS, 'Access-Control-Allow-Headers': 'Content-Type' } });
}
