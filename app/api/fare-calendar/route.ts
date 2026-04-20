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

interface FareItem {
  departureDate: string;
  returnDate:    string;
  price:         number;
  isDirect:      boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFareCalendar(data: any): FareItem[] {
  if (!data) return [];

  // Try common response shapes from MRT MCP
  const itins: unknown[] =
    data?.result?.itineraries  ??
    data?.itineraries           ??
    data?.result?.items         ??
    data?.items                 ??
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(itins) || itins.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return itins.map((item: any) => ({
    departureDate: item.departureDate ?? item.outboundDate ?? item.date ?? '',
    returnDate:    item.returnDate    ?? item.inboundDate  ?? item.returnDate ?? '',
    price:         Number(item.price?.total ?? item.totalPrice ?? item.lowestPrice ?? item.price ?? 0),
    isDirect:      item.isDirect ?? item.direct ?? true,
  }))
  .filter(f => f.price > 0 && f.departureDate)
  .sort((a, b) => a.price - b.price);
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin') ?? 'ICN';
  const period = parseInt(request.nextUrl.searchParams.get('period') ?? '3');
  const departureDate = todayPlus(7); // start scanning from 7 days out

  try {
    const [fukData, kixData] = await Promise.all([
      callMrtMcp('flightsFareCalendar', {
        from: origin, to: 'FUK', departureDate, period,
        maxResults: 5, transfer: 0, international: true, airlines: ['*'],
      }),
      callMrtMcp('flightsFareCalendar', {
        from: origin, to: 'KIX', departureDate, period,
        maxResults: 5, transfer: 0, international: true, airlines: ['*'],
      }),
    ]);

    const fuk = parseFareCalendar(fukData);
    const kix = parseFareCalendar(kixData);

    return NextResponse.json(
      { fuk, kix, fetchedAt: new Date().toISOString(), origin, period },
      { headers: CORS }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { ...CORS, 'Access-Control-Allow-Headers': 'Content-Type' } });
}
