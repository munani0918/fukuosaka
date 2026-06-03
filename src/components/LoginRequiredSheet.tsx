"use client";

import { buildLoginUrl } from "@/src/lib/auth/client";

type LoginRequiredSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginRequiredSheet({ open, onClose }: LoginRequiredSheetProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[#2c211d]/34 px-4 pb-[calc(env(safe-area-inset-bottom)+18px)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[398px] rounded-[30px] border border-[#f0d8ce] bg-[#fffdfb] p-5 shadow-[0_26px_70px_rgba(60,34,25,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#ead8cf]" />
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ef665b]">
          FUKUOSAKA
        </p>
        <h2
          id="login-required-title"
          className="mt-2 text-[22px] font-black tracking-[-0.06em] text-[#2c211d]"
        >
          로그인이 필요해요
        </h2>
        <p className="mt-3 text-[14px] font-semibold leading-relaxed text-[#74635c]">
          저장한 여행과 찜한 상품은 로그인 후 관리할 수 있어요.
        </p>
        <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-[#9a8a82]">
          로그인하면 여행 계획을 더 안정적으로 보관할 수 있어요.
        </p>
        <div className="mt-5 grid gap-2">
          <a
            href={buildLoginUrl()}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#f26b61] px-5 py-3 text-[14px] font-black text-white shadow-[0_14px_28px_rgba(219,85,75,0.18)]"
          >
            로그인하고 계속하기
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#ead7cf] bg-white px-5 py-3 text-[13px] font-black text-[#8a6f66]"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
