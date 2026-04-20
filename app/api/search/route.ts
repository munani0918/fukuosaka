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

// ── Widget tree parser (stays / tnas) ─────────────────────────────────────────
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
  return findListViewItems(widget).slice(0, 5).map(extractFromItem);
}

function parseTnas(data: Record<string, unknown> | null) {
  const widget = (data as { widget?: WidgetNode })?.widget;
  if (!widget) return [];
  return findListViewItems(widget).slice(0, 8).map(item => {
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

// ── Flights parser ────────────────────────────────────────────────────────────
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

function parseFlights(data: Record<string, unknown> | null) {
  const items: FlightItem[] = (data as { result?: { items?: FlightItem[] } })?.result?.items ?? [];
  const fmt = (t?: string) => t ? `${t.substring(0, 2)}:${t.substring(2)}` : '';
  return items.slice(0, 5).map((item) => {
    const out = item.legs?.find(l => l.legIndex === 1) ?? item.legs?.[0];
    const ret = item.legs?.find(l => l.legIndex === 2) ?? item.legs?.[1];
    return {
      airline: item.airline?.name ?? '',
      airlineCode: item.airline?.code ?? '',
      logoUrl: item.airline?.logoUrl ?? '',
      isDirect: out?.isDirect ?? true,
      isCheapest: item.isCheapest ?? false,
      price: item.price?.total ?? 0,
      reservationUrl: item.reservationUrl ?? '',
      outbound: {
        date: out?.departDate ?? '',
        departTime: fmt(out?.departTime),
        arriveTime: fmt(out?.arriveTime),
        duration: out?.durationMinutes ?? 0,
        origin: out?.segments?.[0]?.departure?.cityCode ?? '',
        destination: out?.segments?.[0]?.arrival?.cityCode ?? '',
      },
      inbound: ret ? {
        date: ret.departDate ?? '',
        departTime: fmt(ret.departTime),
        arriveTime: fmt(ret.arriveTime),
        duration: ret.durationMinutes ?? 0,
        origin: ret.segments?.[0]?.departure?.cityCode ?? '',
        destination: ret.segments?.[0]?.arrival?.cityCode ?? '',
      } : null,
    };
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const type = p.get('type');

  try {
    // ── Stays ──
    if (type === 'stays') {
      const keyword    = p.get('keyword')    ?? '오사카';
      const checkIn    = p.get('checkIn')    ?? '';
      const checkOut   = p.get('checkOut')   ?? '';
      const adultCount = parseInt(p.get('adultCount') ?? '2');
      const data = await callMrtMcp('searchStays', { keyword, checkIn, checkOut, adultCount });
      return NextResponse.json({ stays: parseStays(data as Record<string, unknown>) }, { headers: CORS });
    }

    // ── TNAs ──
    if (type === 'tnas') {
      const query   = p.get('query')   ?? '오사카 관광';
      const perPage = parseInt(p.get('perPage') ?? '8');
      const data = await callMrtMcp('searchTnas', { query, perPage });
      return NextResponse.json({ tnas: parseTnas(data as Record<string, unknown>) }, { headers: CORS });
    }

    // ── Flights ──
    if (type === 'flights') {
      const origin      = p.get('origin')      ?? 'ICN';
      const destination = p.get('destination') ?? 'KIX';
      const departDate  = p.get('departDate')  ?? '';
      const returnDate  = p.get('returnDate')  ?? '';
      const tripType    = returnDate ? 'ROUND_TRIP' : 'ONE_WAY';
      const data = await callMrtMcp('searchInternationalFlights', {
        origin, destination, departDate, returnDate, tripType, maxResults: 5,
      });
      return NextResponse.json({ flights: parseFlights(data as Record<string, unknown>) }, { headers: CORS });
    }

    return NextResponse.json({ error: 'type 파라미터가 필요합니다 (stays | tnas | flights)' }, { status: 400, headers: CORS });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { ...CORS, 'Access-Control-Allow-Headers': 'Content-Type' } });
}
