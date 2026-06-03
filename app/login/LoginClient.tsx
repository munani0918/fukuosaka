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

export function LoginClient({ nextPath, error }: LoginClientProps) {
  const kakaoHref = `/api/auth/kakao/start?next=${encodeURIComponent(nextPath)}`;
  const googleHref = `/api/auth/google/start?next=${encodeURIComponent(nextPath)}`;
  const errorMessage = messageForError(error);

  return (
    <main className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_52%,#fff1ec_100%)] px-5 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-[calc(env(safe-area-inset-top)+18px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="flex items-center justify-end">
          <Link
            href={nextPath}
            className="rounded-full bg-white/80 px-4 py-2 text-[13px] font-black text-[#8a6b61] shadow-[0_8px_18px_rgba(126,74,61,0.06)]"
          >
            건너뛰기
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="text-center">
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-[#ef665b]">
              FUKUOSAKA
            </p>
            <h1 className="mt-5 text-[32px] font-black leading-[1.17] tracking-[-0.07em]">
              예산에 맞는
              <br />
              후쿠오카·오사카 여행 준비
            </h1>
            <p className="mx-auto mt-4 max-w-[310px] text-[14px] font-semibold leading-relaxed text-[#7a6c65]">
              로그인하면 저장한 여행과 찜한 상품을 더 안정적으로 관리할 수 있어요.
            </p>
          </div>

          <div className="mx-auto mt-9 flex h-[154px] w-full max-w-[300px] items-center justify-center rounded-[34px] border border-[#f1d8ce] bg-white/78 shadow-[0_18px_42px_rgba(126,74,61,0.08)]">
            <div className="relative h-[116px] w-[220px]">
              <div className="absolute left-6 top-8 h-20 w-24 rotate-[-6deg] rounded-[22px] bg-[#fff0e8] shadow-inner" />
              <div className="absolute left-12 top-3 h-24 w-28 rounded-[26px] bg-[linear-gradient(135deg,#ff8a76,#f15d55)] p-4 text-white shadow-[0_16px_30px_rgba(214,95,85,0.22)]">
                <div className="h-3 w-14 rounded-full bg-white/60" />
                <div className="mt-4 h-3 w-20 rounded-full bg-white/80" />
                <div className="mt-2 h-3 w-12 rounded-full bg-white/50" />
              </div>
              <div className="absolute right-8 top-10 h-16 w-12 rounded-[14px] bg-[#fff7ef] shadow-[0_10px_20px_rgba(126,74,61,0.12)]">
                <div className="mx-auto mt-[-7px] h-3 w-7 rounded-t-full border-2 border-[#f15d55]" />
                <div className="mx-auto mt-4 h-6 w-1 rounded-full bg-[#f6b5a6]" />
              </div>
              <span className="absolute right-3 top-3 text-[20px] text-[#f0b65d]">✦</span>
              <span className="absolute bottom-2 left-5 text-[17px] text-[#f6a596]">✦</span>
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-5 rounded-2xl border border-[#ffd8d2] bg-[#fff3f0] px-4 py-3 text-center text-[13px] font-bold text-[#c75049]">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-7 space-y-3">
            <a
              href={kakaoHref}
              className="flex min-h-[54px] w-full items-center justify-center rounded-[18px] bg-[#fee500] px-5 text-[15px] font-black text-[#191600] shadow-[0_14px_26px_rgba(120,86,18,0.12)] transition active:scale-[0.99]"
            >
              카카오로 계속하기
            </a>
            <a
              href={googleHref}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[18px] border border-[#e5d8d0] bg-white px-5 text-[15px] font-black text-[#3a302c] shadow-[0_12px_22px_rgba(126,74,61,0.05)] transition active:scale-[0.99]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e1d9d4] text-[15px] font-black">
                G
              </span>
              Google로 계속하기
            </a>
          </div>
        </section>

        <PolicyLinks />
      </div>
    </main>
  );
}
