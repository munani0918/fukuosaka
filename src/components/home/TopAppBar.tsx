import Link from "next/link";

import { BookmarkIcon, UserIcon } from "@/src/components/home/icons";

export function TopAppBar() {
  return (
    <header className="px-5 pt-[calc(env(safe-area-inset-top)+10px)]">
      <div className="flex h-12 items-center justify-between">
        <Link
          href="/"
          className="text-[16px] font-black tracking-[-0.03em] text-[#f35f5b]"
        >
          후쿠오사카
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="저장"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/88 text-[#5f5550] ring-1 ring-[#f1e4dc]"
          >
            <BookmarkIcon className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            aria-label="마이"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/88 text-[#5f5550] ring-1 ring-[#f1e4dc]"
          >
            <UserIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
