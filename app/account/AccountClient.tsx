"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthUser = {
  provider: "kakao";
  nickname: string;
  profileImage?: string;
};

type AuthState =
  | { loading: true; loggedIn: false; user: null }
  | { loading: false; loggedIn: false; user: null }
  | { loading: false; loggedIn: true; user: AuthUser };

type AccountClientProps = {
  loginStatus?: string;
  error?: string;
};

function messageForError(error?: string) {
  if (error === "invalid_state") {
    return "로그인 요청이 만료되었어요. 다시 시도해주세요.";
  }
  if (error === "kakao_login_failed") {
    return "카카오 로그인 중 문제가 발생했어요. 다시 시도해주세요.";
  }
  return null;
}

export function AccountClient({ loginStatus, error }: AccountClientProps) {
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    loggedIn: false,
    user: null,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as {
          loggedIn?: boolean;
          user?: AuthUser | null;
        };
        if (!mounted) return;
        if (data.loggedIn && data.user) {
          setAuth({ loading: false, loggedIn: true, user: data.user });
        } else {
          setAuth({ loading: false, loggedIn: false, user: null });
        }
      } catch {
        if (mounted) {
          setAuth({ loading: false, loggedIn: false, user: null });
        }
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    setMessage("");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
      setAuth({ loading: false, loggedIn: false, user: null });
      setMessage("로그아웃했어요.");
    } catch {
      setMessage("로그아웃 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  const errorMessage = messageForError(error);

  if (auth.loading) {
    return (
      <section className="mt-8 rounded-[30px] border border-[#f0ded6] bg-white/86 p-5 shadow-[0_18px_42px_rgba(126,74,61,0.08)]">
        <p className="text-[14px] font-bold text-[#76675f]">로그인 상태를 확인하고 있어요.</p>
      </section>
    );
  }

  if (!auth.loggedIn) {
    return (
      <section className="mt-8 space-y-4">
        {errorMessage ? (
          <p className="rounded-2xl border border-[#ffd8d2] bg-[#fff3f0] px-4 py-3 text-[13px] font-bold text-[#c75049]">
            {errorMessage}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-2xl border border-[#eadbd3] bg-white/80 px-4 py-3 text-[13px] font-bold text-[#7a6c65]">
            {message}
          </p>
        ) : null}

        <div className="rounded-[30px] border border-[#f0ded6] bg-white/86 p-5 shadow-[0_18px_42px_rgba(126,74,61,0.08)]">
          <div className="mb-4 inline-flex rounded-full bg-[#fff2ed] px-3 py-1 text-[11px] font-black text-[#d95f55]">
            로그인 필요
          </div>
          <h2 className="text-[22px] font-black leading-tight tracking-[-0.055em]">
            로그인하고 여행 계획을 더 안정적으로 관리해보세요.
          </h2>
          <p className="mt-3 text-[14px] font-semibold leading-relaxed text-[#76675f]">
            현재 저장한 여행과 찜한 상품은 이 브라우저에 보관돼요. 로그인 기능은
            계정 기반 저장으로 확장하기 위한 첫 단계예요.
          </p>
          <Link
            href="/login?next=/account"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#f26b61] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(214,95,85,0.18)] transition active:scale-[0.99]"
          >
            로그인하기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-4">
      {loginStatus === "success" ? (
        <p className="rounded-2xl border border-[#dcebd8] bg-[#f6fff4] px-4 py-3 text-[13px] font-bold text-[#4f784a]">
          로그인됐어요.
        </p>
      ) : null}

      <div className="rounded-[30px] border border-[#f0ded6] bg-white/86 p-5 shadow-[0_18px_42px_rgba(126,74,61,0.08)]">
        <div className="flex items-center gap-4">
          {auth.user.profileImage ? (
            <div
              aria-hidden="true"
              className="h-14 w-14 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${auth.user.profileImage})` }}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0e9] text-[20px] font-black text-[#ef665b]">
              {auth.user.nickname.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[12px] font-black text-[#d95f55]">카카오로 로그인됨</p>
            <h2 className="truncate text-[22px] font-black tracking-[-0.055em]">
              {auth.user.nickname}
            </h2>
          </div>
        </div>
        <p className="mt-5 text-[14px] font-semibold leading-relaxed text-[#76675f]">
          저장한 여행과 찜한 상품은 아직 이 브라우저 보관함을 기준으로 보여줘요.
          계정 저장 전환은 다음 단계에서 확장할 예정입니다.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-[#ead6cc] bg-white px-5 py-3 text-[14px] font-black text-[#7a5d54] transition active:scale-[0.99]"
        >
          로그아웃
        </button>
      </div>
    </section>
  );
}
