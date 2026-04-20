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

interface FlightItem {
  airline?: { name?: string };
  legs?: Array<{
    legIndex?: number; isDirect?: boolean; durationMinutes?: number;
    departDate?: string; departTime?: string; arriveDate?: string; arriveTime?: string;
  }>;
  price?: { total?: number };
  isCheapest?: boolean;
}

function cheapestFromSearch(data: Record<string, unknown> | null, departDate: string, returnDate: string) {
  const items: FlightItem[] = (data as { result?: { items?: FlightItem[] } })?.result?.items ?? [];
  if (!items.length) return null;

  const sorted = items
    .map(f => ({ price: f.price?.total ?? 0, airline: f.airline?.name ?? '', isDirect: f.legs?.[0]?.isDirect ?? true }))
    .filter(f => f.price > 0)
    .sort((a, b) => a.price - b.price);

  if (!sorted.length) return null;
  return { ...sorted[0], departureDate: departDate, returnDate };
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Search 3 date windows per route in parallel, return the cheapest found
async function findCheapest(origin: string, destination: string, nights: number) {
  const windows = [35, 49, 63]; // 5주, 7주, 9주 후 출발
  const searches = windows.map(offset => {
    const dep = todayPlus(offset);
    const ret = todayPlus(offset + nights);
    return callMrtMcp('searchInternationalFlights', {
      origin, destination,
      departDate: dep, returnDate: ret,
      tripType: 'ROUND_TRIP', maxResults: 3,
    }).then(data => cheapestFromSearch(data as Record<string, unknown> | null, dep, ret));
  });

  const results = await Promise.all(searches);
  const valid = results.filter(Boolean) as NonNullable<ReturnType<typeof cheapestFromSearch>>[];
  if (!valid.length) return null;
  return valid.sort((a, b) => a.price - b.price)[0];
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin') ?? 'ICN';
  const nights = parseInt(request.nextUrl.searchParams.get('nights') ?? '3');

  try {
    const [fuk, kix] = await Promise.all([
      findCheapest(origin, 'FUK', nights),
      findCheapest(origin, 'KIX', nights),
    ]);

    return NextResponse.json(
      { fuk, kix, fetchedAt: new Date().toISOString(), origin, nights },
      { headers: CORS }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { ...CORS, 'Access-Control-Allow-Headers': 'Content-Type' } });
}
