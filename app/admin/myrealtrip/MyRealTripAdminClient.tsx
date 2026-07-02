"use client";

import { FormEvent, useEffect, useState } from "react";

type Row = Record<string, unknown>;
type QueryKind = "reservations" | "flightReservations" | "revenues" | "flightRevenues";
type QueryState = {
  loading: boolean;
  error: string;
  rows: Row[];
  totalCount: number;
  resultStatus?: number;
  resultCode?: string;
  queried: boolean;
};
type SystemState = {
  loading: boolean;
  authenticated: boolean;
  upstream: "unknown" | "ok" | "error";
  partnerApiKeyConfigured: boolean;
  mylinkIdConfigured: boolean;
  mylinkApiAvailable: boolean;
  mylinkHostOk: boolean;
  openInAppSupported: boolean;
  legacyRevenueSafe: boolean;
  message: string;
};
type Column = { key: string; label: string; kind?: "money" | "date" | "masked" };

const TOKEN_STORAGE_KEY = "fukuosaka_admin_api_token";
const EMPTY_QUERY: QueryState = { loading: false, error: "", rows: [], totalCount: 0, queried: false };
const GENERAL_STATUSES = ["", "TEMP", "WAIT_DEPOSIT", "PENDING_PAYMENT", "WAIT_CONFIRM", "CONFIRM", "REQUEST_CANCEL", "FINISH", "CANCEL", "FAIL"];
const FLIGHT_STATUSES = ["", "WAITING", "RESERVED", "IN_PAY", "CONFIRMED", "NOT_PAID_CONFIRMED", "CANCELLED"];

const columns: Record<QueryKind, Column[]> = {
  reservations: [
    { key: "reservedAt", label: "예약일", kind: "date" },
    { key: "reservationNo", label: "예약번호", kind: "masked" },
    { key: "statusKor", label: "상태" },
    { key: "salePrice", label: "판매금액", kind: "money" },
    { key: "commissionBase", label: "정산대상금액", kind: "money" },
    { key: "productTitle", label: "상품명" },
    { key: "productCategory", label: "상품 카테고리" },
    { key: "city", label: "도시" },
    { key: "country", label: "국가" },
    { key: "quantity", label: "수량" },
    { key: "linkId", label: "Link ID", kind: "masked" },
    { key: "utmContent", label: "UTM" },
    { key: "tripStartedAtKst", label: "여행 시작", kind: "date" },
    { key: "tripEndedAtKst", label: "여행 종료", kind: "date" },
    { key: "canceledAt", label: "취소일", kind: "date" },
    { key: "finishedAt", label: "완료일", kind: "date" },
  ],
  flightReservations: [
    { key: "reservedAt", label: "예약일", kind: "date" },
    { key: "reservationNo", label: "예약번호", kind: "masked" },
    { key: "flightReservationNo", label: "항공 예약번호", kind: "masked" },
    { key: "statusKor", label: "상태" },
    { key: "airlineName", label: "항공사" },
    { key: "airline", label: "코드" },
    { key: "operationScope", label: "운항 범위" },
    { key: "tripType", label: "여행 타입" },
    { key: "issueNet", label: "항공료", kind: "money" },
    { key: "gid", label: "GID" },
    { key: "categoryCode", label: "카테고리 코드" },
    { key: "linkId", label: "Link ID", kind: "masked" },
    { key: "utmContent", label: "UTM" },
    { key: "cancelledAt", label: "취소일", kind: "date" },
  ],
  revenues: [
    { key: "settlementCriteriaDate", label: "정산 기준일", kind: "date" },
    { key: "reservationNo", label: "예약번호", kind: "masked" },
    { key: "productTitle", label: "상품명" },
    { key: "productCategory", label: "상품 카테고리" },
    { key: "statusKor", label: "상태" },
    { key: "salePrice", label: "판매금액", kind: "money" },
    { key: "commissionBase", label: "정산대상금액", kind: "money" },
    { key: "commission", label: "수익", kind: "money" },
    { key: "commissionRate", label: "수익률" },
    { key: "closingType", label: "주문 구분" },
    { key: "reservedAt", label: "예약일", kind: "date" },
    { key: "linkId", label: "Link ID", kind: "masked" },
    { key: "utmContent", label: "UTM" },
    { key: "city", label: "도시" },
    { key: "country", label: "국가" },
  ],
  flightRevenues: [
    { key: "settlementCriteriaDate", label: "정산 기준일", kind: "date" },
    { key: "reservationNo", label: "예약번호", kind: "masked" },
    { key: "flightReservationNo", label: "항공 예약번호", kind: "masked" },
    { key: "productTitle", label: "상품명" },
    { key: "statusKor", label: "상태" },
    { key: "salePrice", label: "판매금액", kind: "money" },
    { key: "commissionBase", label: "정산대상금액", kind: "money" },
    { key: "commission", label: "수익", kind: "money" },
    { key: "commissionRate", label: "수익률" },
    { key: "closingType", label: "주문 구분" },
    { key: "reservedAt", label: "예약일", kind: "date" },
    { key: "tripStartedAt", label: "여행 시작", kind: "date" },
    { key: "tripEndedAt", label: "여행 종료", kind: "date" },
    { key: "linkId", label: "Link ID", kind: "masked" },
    { key: "utmContent", label: "UTM" },
    { key: "city", label: "도시" },
    { key: "country", label: "국가" },
  ],
};

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number) {
  return isoDate(-days);
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatMoney(value: unknown) {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(toNumber(value));
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const text = String(value).replace(/[Asia/Seoul]$/, "");
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: text.includes("T") ? "short" : undefined }).format(date);
}

function maskIdentifier(value: unknown) {
  const text = String(value ?? "");
  if (!text) return "-";
  if (text.startsWith("****")) return text;
  return text.length <= 4 ? "****" : `****${text.slice(-4)}`;
}

function safeText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return "-";
  return String(value);
}

function getRows(payload: unknown): { rows: Row[]; totalCount: number; resultStatus?: number; resultCode?: string } {
  const outer = payload && typeof payload === "object" ? payload as Row : {};
  const partner = outer.data && typeof outer.data === "object" ? outer.data as Row : {};
  const rawData = partner.data;
  let rows: Row[] = [];
  if (Array.isArray(rawData)) rows = rawData.filter((item): item is Row => Boolean(item && typeof item === "object"));
  if (rawData && !Array.isArray(rawData) && typeof rawData === "object") {
    const dataObject = rawData as Row;
    const candidate = dataObject.items ?? dataObject.content ?? dataObject.reservations ?? dataObject.revenues;
    if (Array.isArray(candidate)) rows = candidate.filter((item): item is Row => Boolean(item && typeof item === "object"));
  }
  const meta = partner.meta && typeof partner.meta === "object" ? partner.meta as Row : {};
  const result = partner.result && typeof partner.result === "object" ? partner.result as Row : {};
  const totalCount = toNumber(meta.totalCount ?? meta.total ?? meta.totalElements ?? rows.length);
  return { rows, totalCount, resultStatus: toNumber(result.status) || undefined, resultCode: typeof result.code === "string" ? result.code : undefined };
}

function rangeDays(start: string, end: string) {
  return Math.floor((new Date(end + "T00:00:00Z").getTime() - new Date(start + "T00:00:00Z").getTime()) / 86_400_000) + 1;
}

export function MyRealTripAdminClient() {
  const [tokenInput, setTokenInput] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [system, setSystem] = useState<SystemState>({ loading: false, authenticated: false, upstream: "unknown", partnerApiKeyConfigured: false, mylinkIdConfigured: false, mylinkApiAvailable: false, mylinkHostOk: false, openInAppSupported: false, legacyRevenueSafe: false, message: "운영자 토큰을 입력하면 점검을 시작합니다." });
  const [queries, setQueries] = useState<Record<QueryKind, QueryState>>({ reservations: EMPTY_QUERY, flightReservations: EMPTY_QUERY, revenues: EMPTY_QUERY, flightRevenues: EMPTY_QUERY });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
      if (saved) setAuthToken(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function adminFetch(path: string, token = authToken) {
    return fetch(path, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  }

  async function runSystemCheck(token = authToken) {
    if (!token) return;
    setSystem((current) => ({ ...current, loading: true, message: "상태를 확인하고 있습니다." }));
    try {
      const healthResponse = await adminFetch("/api/admin/myrealtrip/health", token);
      const healthBody = await healthResponse.json().catch(() => ({})) as Row;
      if (!healthResponse.ok) {
        setSystem((current) => ({ ...current, loading: false, authenticated: false, upstream: "error", message: healthResponse.status === 401 ? "운영자 토큰이 올바르지 않습니다." : safeText(healthBody.error) }));
        return;
      }
      const healthData = healthBody.data && typeof healthBody.data === "object" ? healthBody.data as Row : {};
      const config = healthData.configuration && typeof healthData.configuration === "object" ? healthData.configuration as Row : {};
      const [legacyResponse, mylinkResponse] = await Promise.all([
        fetch("/api/myrealtrip/revenues", { cache: "no-store" }),
        fetch("/api/myrealtrip/mylink", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUrl: "https://www.myrealtrip.com/", utmContent: "admin-health", openInApp: true }), cache: "no-store" }),
      ]);
      const mylinkBody = await mylinkResponse.json().catch(() => ({})) as Row;
      const api = mylinkBody.api && typeof mylinkBody.api === "object" ? mylinkBody.api as Row : {};
      const param = mylinkBody.param && typeof mylinkBody.param === "object" ? mylinkBody.param as Row : {};
      let hostOk = false;
      try { hostOk = new URL(String(mylinkBody.preferredUrl ?? "")).hostname === "myrealt.rip"; } catch { hostOk = false; }
      setSystem({
        loading: false,
        authenticated: true,
        upstream: "ok",
        partnerApiKeyConfigured: config.partnerApiKeyConfigured === true,
        mylinkIdConfigured: config.mylinkIdConfigured === true,
        mylinkApiAvailable: api.ok === true,
        mylinkHostOk: hostOk,
        openInAppSupported: String(param.url ?? "").includes("open_in_app=true"),
        legacyRevenueSafe: legacyResponse.status === 404,
        message: "운영 API 상태 점검을 완료했습니다.",
      });
    } catch {
      setSystem((current) => ({ ...current, loading: false, authenticated: false, upstream: "error", message: "상태 점검 중 네트워크 오류가 발생했습니다." }));
    }
  }

  function connect(event: FormEvent) {
    event.preventDefault();
    const nextToken = tokenInput.trim();
    if (!nextToken) return;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setAuthToken(nextToken);
    setTokenInput("");
    void runSystemCheck(nextToken);
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken("");
    setTokenInput("");
    setQueries({ reservations: EMPTY_QUERY, flightReservations: EMPTY_QUERY, revenues: EMPTY_QUERY, flightRevenues: EMPTY_QUERY });
    setSystem({ loading: false, authenticated: false, upstream: "unknown", partnerApiKeyConfigured: false, mylinkIdConfigured: false, mylinkApiAvailable: false, mylinkHostOk: false, openInAppSupported: false, legacyRevenueSafe: false, message: "운영자 세션을 종료했습니다." });
  }

  async function runQuery(kind: QueryKind, path: string, params: URLSearchParams, maxDays?: number) {
    if (!authToken) return;
    const start = params.get("startDate") ?? "";
    const end = params.get("endDate") ?? "";
    if (start && end && maxDays && (rangeDays(start, end) < 1 || rangeDays(start, end) > maxDays)) {
      setQueries((current) => ({ ...current, [kind]: { ...EMPTY_QUERY, queried: true, error: `조회 기간은 최대 ${maxDays}일입니다.` } }));
      return;
    }
    setQueries((current) => ({ ...current, [kind]: { ...current[kind], loading: true, error: "" } }));
    try {
      const response = await adminFetch(`${path}?${params.toString()}`);
      const body = await response.json().catch(() => ({})) as Row;
      if (!response.ok) {
        setQueries((current) => ({ ...current, [kind]: { ...EMPTY_QUERY, queried: true, error: response.status === 401 ? "운영자 인증이 만료되었거나 올바르지 않습니다." : safeText(body.error) } }));
        return;
      }
      const parsed = getRows(body);
      setQueries((current) => ({ ...current, [kind]: { loading: false, error: "", queried: true, ...parsed } }));
    } catch {
      setQueries((current) => ({ ...current, [kind]: { ...EMPTY_QUERY, queried: true, error: "조회 중 네트워크 오류가 발생했습니다." } }));
    }
  }

  return (
    <main className="min-h-dvh bg-[#f7eee8] px-4 py-8 text-[#2c211d] md:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-[30px] border border-[#ead9d1] bg-[linear-gradient(135deg,#fffdfb,#fff0e8)] p-6 shadow-[0_20px_60px_rgba(112,69,55,0.10)] md:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-[#df6258]">FUKUOSAKA OPERATIONS</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-5xl">마이리얼트립 운영 <span className="whitespace-nowrap">대시보드</span></h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-[#806e66]">일반·항공 예약과 수익을 분리해 조회합니다. 수익은 예약 직후가 아니라 다음날 정산 이후 확인하는 흐름이 안전합니다.</p>
            </div>
            {authToken ? (
              <div className="flex gap-2"><button type="button" onClick={() => void runSystemCheck()} className="rounded-full bg-[#e96359] px-5 py-3 text-sm font-black text-white">상태 다시 확인</button><button type="button" onClick={clearSession} className="rounded-full border border-[#dac9c1] bg-white px-5 py-3 text-sm font-bold text-[#75645d]">운영 세션 종료</button></div>
            ) : null}
          </div>
        </header>

        {!authToken ? (
          <section className="mx-auto mt-8 max-w-xl rounded-[28px] border border-[#eadbd4] bg-white p-6 shadow-[0_18px_45px_rgba(112,69,55,0.08)]">
            <h2 className="text-xl font-black">운영자 인증</h2>
            <p className="mt-2 text-sm leading-6 text-[#806e66]">ADMIN_API_TOKEN은 이 브라우저 탭의 sessionStorage에만 보관되며 화면에 다시 표시하지 않습니다.</p>
            <form onSubmit={connect} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} autoComplete="off" placeholder="운영자 토큰 입력" className="min-w-0 flex-1 rounded-2xl border border-[#dfd0c9] bg-[#fffaf7] px-4 py-3 text-sm outline-none focus:border-[#e96359]" />
              <button type="submit" className="rounded-2xl bg-[#34231f] px-6 py-3 text-sm font-black text-white">대시보드 열기</button>
            </form>
            <p className="mt-4 rounded-2xl bg-[#fff3ed] px-4 py-3 text-xs font-semibold leading-5 text-[#8b675b]">토큰 입력 전에는 예약·수익 API를 호출하지 않습니다.</p>
          </section>
        ) : (
          <>
            <SystemCards system={system} />
            <section className="mt-7 grid gap-3 rounded-[24px] border border-[#eadbd4] bg-[#fffaf7] p-5 text-sm font-semibold leading-6 text-[#745f57] md:grid-cols-2">
              <p>• 일반 예약은 실시간 업데이트되며 최대 6개월까지 조회할 수 있습니다.</p><p>• 항공 예약은 일반 예약과 별도이며 최대 1개월까지 조회할 수 있습니다.</p><p>• 수익은 매일 오전 6시 정산 완료 후 전일까지 확인할 수 있습니다.</p><p>• 환불·부분환불은 commission이 마이너스로 반환될 수 있습니다.</p>
            </section>
            <div className="mt-8 space-y-8">
              <QueryPanel kind="reservations" title="일반 예약 조회" description="예약일 또는 여행 종료일 기준, 최대 6개월" path="/api/admin/myrealtrip/reservations" statuses={GENERAL_STATUSES} dateSearchTypes={["RESERVATION_DATE", "TRIP_END_DATE"]} maxDays={186} state={queries.reservations} onRun={runQuery} />
              <QueryPanel kind="flightReservations" title="항공 예약 조회" description="항공 예약 상태 기준, 최대 1개월" path="/api/admin/myrealtrip/reservations/flight" statuses={FLIGHT_STATUSES} maxDays={31} state={queries.flightReservations} onRun={runQuery} />
              <QueryPanel kind="revenues" title="일반 수익 조회" description="정산 완료된 전일까지의 일반 상품 수익" path="/api/admin/myrealtrip/revenues" dateSearchTypes={["SETTLEMENT", "PAYMENT"]} state={queries.revenues} onRun={runQuery} />
              <QueryPanel kind="flightRevenues" title="항공 수익 조회" description="일반 수익과 별도로 정산되는 항공 수익" path="/api/admin/myrealtrip/revenues/flight" dateSearchTypes={["SETTLEMENT", "PAYMENT"]} state={queries.flightRevenues} onRun={runQuery} />
            </div>
          </>
        )}
        <p className="mt-10 text-center text-xs text-[#9b8880]">개인정보와 OAuth/API 비밀값은 이 화면에 표시하지 않습니다.</p>
      </div>
    </main>
  );
}

function SystemCards({ system }: { system: SystemState }) {
  const cards = [
    ["관리자 인증", system.authenticated, system.authenticated ? "인증됨" : "확인 필요"],
    ["Partner API Key", system.partnerApiKeyConfigured, system.partnerApiKeyConfigured ? "서버 설정됨" : "설정 필요"],
    ["Upstream", system.upstream === "ok", system.upstream === "ok" ? "정상" : system.upstream === "error" ? "오류" : "미확인"],
    ["MyLink ID", system.mylinkIdConfigured, system.mylinkIdConfigured ? "서버 설정됨" : "설정 필요"],
    ["단축 링크", system.mylinkApiAvailable && system.mylinkHostOk, system.mylinkApiAvailable && system.mylinkHostOk ? "myrealt.rip 정상" : "점검 필요"],
    ["open_in_app", system.openInAppSupported, system.openInAppSupported ? "흐름 유지" : "점검 필요"],
    ["레거시 수익 route", system.legacyRevenueSafe, system.legacyRevenueSafe ? "404 안전" : "노출 점검"],
  ] as const;
  return <section className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">API 상태</h2><span className="text-xs font-semibold text-[#8a7770]">{system.loading ? "확인 중..." : system.message}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, ok, value]) => <div key={label} className="rounded-[22px] border border-[#eadbd4] bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-[#8a7770]">{label}</p><span className={`rounded-full px-2 py-1 text-[10px] font-black ${ok ? "bg-[#e8f6ed] text-[#287a48]" : "bg-[#fff0ec] text-[#c94f47]"}`}>{ok ? "정상" : "주의"}</span></div><p className="mt-3 text-sm font-black">{value}</p></div>)}</div><p className="mt-3 text-xs font-semibold text-[#8a7770]">예약·수익 응답의 linkId와 utmContent로 유입 구조를 확인할 수 있으며, 실제 MyLink ID 값은 표시하지 않습니다.</p></section>;
}

type QueryPanelProps = {
  kind: QueryKind;
  title: string;
  description: string;
  path: string;
  statuses?: string[];
  dateSearchTypes?: string[];
  maxDays?: number;
  state: QueryState;
  onRun: (kind: QueryKind, path: string, params: URLSearchParams, maxDays?: number) => Promise<void>;
};

function QueryPanel({ kind, title, description, path, statuses, dateSearchTypes, maxDays, state, onRun }: QueryPanelProps) {
  const revenue = kind === "revenues" || kind === "flightRevenues";
  const [startDate, setStartDate] = useState(revenue ? daysAgo(30) : daysAgo(7));
  const [endDate, setEndDate] = useState(revenue ? daysAgo(1) : isoDate());
  const [status, setStatus] = useState("");
  const [dateSearchType, setDateSearchType] = useState(dateSearchTypes?.[0] ?? "");
  const [page, setPage] = useState("1");
  const [pageSize, setPageSize] = useState("20");

  function setQuick(days: number, endOffset = 0) { setEndDate(isoDate(endOffset)); setStartDate(isoDate(endOffset - days + 1)); }
  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ startDate, endDate });
    if (dateSearchType) params.set("dateSearchType", dateSearchType);
    if (status) params.set("statuses", status);
    if (kind === "reservations") { params.set("page", page); params.set("pageSize", pageSize); }
    void onRun(kind, path, params, maxDays);
  }

  return <section className="overflow-hidden rounded-[28px] border border-[#e8d8d0] bg-white shadow-[0_14px_45px_rgba(103,63,50,0.08)]"><div className="border-b border-[#f0e4de] bg-[linear-gradient(90deg,#fff8f4,#fff)] p-5 md:p-6"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2><p className="mt-1 text-sm font-semibold text-[#85736b]">{description}</p></div><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-end"><Field label="시작일"><input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="admin-input" /></Field><Field label="종료일"><input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="admin-input" /></Field>{dateSearchTypes ? <Field label="조회 기준"><select value={dateSearchType} onChange={(e) => setDateSearchType(e.target.value)} className="admin-input">{dateSearchTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field> : null}{statuses ? <Field label="상태"><select value={status} onChange={(e) => setStatus(e.target.value)} className="admin-input">{statuses.map((value) => <option key={value || "all"} value={value}>{value || "전체"}</option>)}</select></Field> : null}{kind === "reservations" ? <><Field label="페이지"><input inputMode="numeric" value={page} onChange={(e) => setPage(e.target.value)} className="admin-input w-20" /></Field><Field label="건수"><input inputMode="numeric" value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="admin-input w-20" /></Field></> : null}<button type="submit" disabled={state.loading} className="h-[42px] rounded-xl bg-[#df6258] px-6 text-sm font-black text-white disabled:opacity-50">{state.loading ? "조회 중" : "조회"}</button></form></div><div className="mt-4 flex flex-wrap gap-2"><Quick label="오늘" onClick={() => setQuick(1)} /><Quick label="어제" onClick={() => setQuick(1, -1)} /><Quick label="최근 7일" onClick={() => setQuick(7, revenue ? -1 : 0)} /><Quick label="최근 30일" onClick={() => setQuick(30, revenue ? -1 : 0)} />{kind === "reservations" ? <Quick label="최근 6개월" onClick={() => setQuick(186)} /> : null}{kind === "flightReservations" ? <Quick label="최근 1개월" onClick={() => setQuick(31)} /> : null}{revenue ? <Quick label="수익 최근 6개월" onClick={() => setQuick(186, -1)} /> : null}</div></div><div className="p-5 md:p-6">{state.error ? <div className="rounded-2xl bg-[#fff0ec] px-4 py-4 text-sm font-bold text-[#b4453f]">{state.error}</div> : <><SummaryCards rows={state.rows} totalCount={state.totalCount} />{!state.loading && state.rows.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#dbc9c1] bg-[#fffaf7] px-4 py-10 text-center text-sm font-bold text-[#88766e]">{state.queried ? "조회 성공, 해당 조건 데이터 없음" : "조회 조건을 선택한 뒤 조회 버튼을 눌러주세요."}</div> : <DataTable rows={state.rows} columns={columns[kind]} />}</>}</div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="flex flex-col gap-1 text-[11px] font-black text-[#806e66]"><span>{label}</span>{children}</label>; }
function Quick({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="rounded-full border border-[#e3d4cd] bg-white px-3 py-1.5 text-xs font-bold text-[#765f57]">{label}</button>; }

function SummaryCards({ rows, totalCount }: { rows: Row[]; totalCount: number }) {
  const sum = (key: string) => rows.reduce((total, row) => total + toNumber(row[key]), 0);
  const negativeCommission = rows.reduce((total, row) => { const value = toNumber(row.commission); return value < 0 ? total + value : total; }, 0);
  const statusCounts = rows.reduce<Record<string, number>>((counts, row) => { const status = safeText(row.statusKor ?? row.status ?? row.closingType); if (status !== "-") counts[status] = (counts[status] ?? 0) + 1; return counts; }, {});
  const items = [["총 건수", new Intl.NumberFormat("ko-KR").format(totalCount || rows.length) + "건"], ["판매금액 합계", formatMoney(sum("salePrice"))], ["정산대상 합계", formatMoney(sum("commissionBase"))], ["수익 합계", formatMoney(sum("commission"))], ["환불·취소 차감", formatMoney(negativeCommission)]];
  return <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{items.map(([label, value]) => <div key={label} className="rounded-2xl bg-[#fff7f3] p-4"><p className="text-xs font-bold text-[#89766e]">{label}</p><p className="mt-2 text-lg font-black tabular-nums">{value}</p></div>)}</div>{Object.keys(statusCounts).length ? <div className="mt-3 flex flex-wrap gap-2">{Object.entries(statusCounts).map(([status, count]) => <span key={status} className="rounded-full bg-[#f4eee9] px-3 py-1 text-xs font-bold text-[#715f57]">{status} {count}</span>)}</div> : null}</>;
}

function DataTable({ rows, columns }: { rows: Row[]; columns: Column[] }) {
  return <div className="mt-5 overflow-x-auto rounded-2xl border border-[#eaded8]"><table className="min-w-max border-collapse text-left text-xs"><thead className="sticky top-0 bg-[#34231f] text-white"><tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3 font-black">{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-t border-[#eee3dd] odd:bg-white even:bg-[#fffaf7]">{columns.map((column) => { const raw = row[column.key]; const value = column.kind === "money" ? formatMoney(raw) : column.kind === "date" ? formatDate(raw) : column.kind === "masked" ? maskIdentifier(raw) : safeText(raw); return <td key={column.key} className={`max-w-[320px] px-4 py-3 align-top ${column.kind === "money" ? "text-right font-bold tabular-nums" : ""}`}>{value}</td>; })}</tr>)}</tbody></table></div>;
}
