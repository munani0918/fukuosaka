"use client";

import Link from "next/link";

import { PolicyLinks } from "@/src/components/PolicyLinks";

type LoginClientProps = {
  nextPath: string;
  error?: string;
};

function messageForError(error?: string) {
  if (error === "invalid_state") {
    return "로그인 요청이 만료되었어요. 다시 시도해주세요.";
  }
  if (error === "kakao_login_failed") {
    return "카카오 로그인 중 문제가 발생했어요. 다시 시도해주세요.";
  }
  if (error === "kakao_not_configured") {
    return "카카오 로그인이 아직 설정되지 않았어요.";
  }
  if (error === "google_login_failed") {
    return "Google 로그인 중 문제가 발생했어요. 다시 시도해주세요.";
  }
  if (error === "google_not_configured") {
    return "Google 로그인이 아직 설정되지 않았어요.";
  }
  return null;
}

function KakaoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[21px] w-[21px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 4.25c-4.56 0-8.25 2.86-8.25 6.39 0 2.24 1.49 4.2 3.73 5.34l-.64 2.6c-.06.25.22.45.43.31l3.12-2.06c.52.08 1.06.12 1.61.12 4.56 0 8.25-2.86 8.25-6.31 0-3.53-3.69-6.39-8.25-6.39Z"
        fill="#191600"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[20px] w-[20px] shrink-0"
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.73-.07-1.43-.19-2.1H12v3.98h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.98-4.31 2.98-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.5c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.9a6 6 0 0 1 0-3.8V7.51H3.05a10 10 0 0 0 0 8.98l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.97c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.97 2.99 14.7 2 12 2a10 10 0 0 0-8.95 5.51l3.34 2.59C7.18 7.73 9.39 5.97 12 5.97Z"
      />
    </svg>
  );
}

function TravelLoginIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-[126px] w-[260px]"
      viewBox="0 0 260 126"
      fill="none"
    >
      <path
        d="M37 34c39-25 79-25 122-10 32 11 54 2 73 25 16 20 5 52-24 58H55C18 104 1 62 37 34Z"
        fill="#FFF3EC"
      />
      <path
        d="M60 47c20-18 48-24 77-17 24 6 39 21 57 13"
        stroke="#F7B8A8"
        strokeWidth="2"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />
      <path
        d="M192 37c0 7-9 17-9 17s-9-10-9-17a9 9 0 1 1 18 0Z"
        fill="#EF665B"
      />
      <circle cx="183" cy="37" r="3" fill="#FFF8F4" />
      <g filter="url(#login-card-shadow)">
        <rect
          x="58"
          y="44"
          width="88"
          height="58"
          rx="18"
          transform="rotate(-6 58 44)"
          fill="white"
        />
      </g>
      <path
        d="M71 61 126 55"
        stroke="#F5B29E"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M73 75 116 70"
        stroke="#E7D2C5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M74 86 105 83"
        stroke="#E7D2C5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="125"
        y="35"
        width="72"
        height="82"
        rx="20"
        fill="url(#passport-gradient)"
      />
      <path
        d="M143 56h36M143 69h27"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".75"
      />
      <circle cx="160" cy="91" r="12" stroke="white" strokeWidth="3" opacity=".55" />
      <path
        d="M197 71h14c8 0 14 6 14 14v20c0 7-5 12-12 12h-16V71Z"
        fill="#FFF9F2"
        stroke="#F3C8B8"
        strokeWidth="2"
      />
      <path
        d="M206 70v-8c0-5 4-9 9-9s9 4 9 9v8"
        stroke="#EF665B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="m42 55 10 4-10 4-4 10-4-10-10-4 10-4 4-10 4 10Z" fill="#F0B65D" />
      <path
        d="m223 31 7 3-7 3-3 7-3-7-7-3 7-3 3-7 3 7Z"
        fill="#F7B8A8"
      />
      <path
        d="M35 101c8 2 18 1 30-3"
        stroke="#F0B65D"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <filter
          id="login-card-shadow"
          x="48"
          y="29"
          width="111"
          height="89"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#7E4A3D" floodOpacity=".12" />
        </filter>
        <linearGradient
          id="passport-gradient"
          x1="125"
          y1="35"
          x2="203"
          y2="111"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF9A7D" />
          <stop offset="1" stopColor="#EF5F56" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LoginClient({ nextPath, error }: LoginClientProps) {
  const kakaoHref = `/api/auth/kakao/start?next=${encodeURIComponent(nextPath)}`;
  const googleHref = `/api/auth/google/start?next=${encodeURIComponent(nextPath)}`;
  const errorMessage = messageForError(error);

  return (
    <main className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_52%,#fff1ec_100%)] px-5 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-[calc(env(safe-area-inset-top)+18px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="flex items-center justify-end">
          <Link
            href="/"
            className="rounded-full bg-white/80 px-4 py-2 text-[13px] font-black text-[#8a6b61] shadow-[0_8px_18px_rgba(126,74,61,0.06)]"
          >
            둘러보기
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-7">
          <div className="text-center">
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-[#ef665b]">
              FUKUOSAKA
            </p>
            <h1 className="mt-4 text-[29px] font-black leading-[1.18] tracking-[-0.055em]">
              예산에 맞는
              <br />
              후쿠오카·오사카 여행
            </h1>
            <p className="mx-auto mt-4 max-w-[310px] text-[14px] font-semibold leading-relaxed text-[#7a6c65]">
              로그인하면 저장한 여행과 찜한 상품을 더 편하게 관리할 수 있어요.
            </p>
          </div>

          <div className="mx-auto mt-8 flex h-[134px] w-full max-w-[292px] items-center justify-center overflow-hidden rounded-[32px] border border-[#f1d8ce] bg-white/78 shadow-[0_16px_36px_rgba(126,74,61,0.08)]">
            <TravelLoginIllustration />
          </div>

          {errorMessage ? (
            <p className="mt-5 rounded-2xl border border-[#ffd8d2] bg-[#fff3f0] px-4 py-3 text-center text-[13px] font-bold text-[#c75049]">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-7 space-y-3">
            <a
              href={kakaoHref}
              className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-[18px] bg-[#fee500] px-5 text-[15px] font-black text-[#191600] shadow-[0_14px_26px_rgba(120,86,18,0.12)] transition active:scale-[0.99]"
            >
              <KakaoIcon />
              <span className="whitespace-nowrap">카카오로 3초 만에 시작하기</span>
            </a>
            <a
              href={googleHref}
              className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-[18px] border border-[#e5d8d0] bg-white px-5 text-[15px] font-black text-[#3a302c] shadow-[0_12px_22px_rgba(126,74,61,0.05)] transition active:scale-[0.99]"
            >
              <GoogleIcon />
              <span className="whitespace-nowrap">Google로 시작하기</span>
            </a>
          </div>
        </section>

        <PolicyLinks />
      </div>
    </main>
  );
}
