import { NextRequest, NextResponse } from 'next/server';

const PARTNER_API = 'https://partner-ext-api.myrealtrip.com';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };

interface FareEntry {
  departureDate: string;
  returnDate:    string;
  fromCity:      string;
  toCity:        string;
  totalPrice:    number;
  averagePrice:  number;
  airline:       string;
  period:        number;
  transfer:      number;
}

function pickCheapest(items: FareEntry[], toCity: string) {
  const filtered = items
    .filter(f => f.toCity === toCity && f.totalPrice > 0)
    .sort((a, b) => a.totalPrice - b.totalPrice);
  if (!filtered.length) return null;
  const best = filtered[0];
  return {
    departureDate: best.departureDate,
    returnDate:    best.returnDate,
    price:         best.totalPrice,
    averagePrice:  best.averagePrice,
    airline:       best.airline,
    isDirect:      best.transfer === 0,
    nights:        best.period,
  };
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.MRT_PARTNER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'MRT_PARTNER_API_KEY 환경변수가 없습니다.' }, { status: 500, headers: CORS });
  }

  const depCityCd = request.nextUrl.searchParams.get('origin') ?? 'ICN';
  const period    = parseInt(request.nextUrl.searchParams.get('period') ?? '4');

  try {
    // 다중 목적지 최저가 조회 — FUK + KIX 한 번에
    const res = await fetch(`${PARTNER_API}/v1/products/flight/calendar/lowest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depCityCd,
        arrCityCds: ['FUK', 'KIX'],
        period,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Partner API ${res.status}: ${errText}` }, { status: res.status, headers: CORS });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await res.json();

    // Partner API may wrap array in { data: [...] } or return array directly
    const items: FareEntry[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)    ? raw.data
      : Array.isArray(raw?.result)  ? raw.result
      : Array.isArray(raw?.results) ? raw.results
      : Array.isArray(raw?.items)   ? raw.items
      : [];

    return NextResponse.json(
      {
        fuk: pickCheapest(items, 'FUK'),
        kix: pickCheapest(items, 'KIX'),
        fetchedAt: new Date().toISOString(),
        origin: depCityCd,
        period,
      },
      { headers: CORS }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { ...CORS, 'Access-Control-Allow-Headers': 'Content-Type' } });
}
