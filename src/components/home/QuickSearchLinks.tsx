import Link from "next/link";

import {
  BedIcon,
  PlaneIcon,
  TicketIcon,
} from "@/src/components/home/icons";

const QUICK_LINKS = [
  {
    title: "최저가 항공권",
    description: "항공권만 보기",
    href: "/flights",
    icon: "flight",
    accent: "bg-[#edf4f8] text-[#425b67] ring-1 ring-[#d8e5eb]",
  },
  {
    title: "맞춤 숙소",
    description: "예산별 숙소 검색",
    href: "/stays",
    icon: "stay",
    accent: "bg-[#f4eee6] text-[#6b5748] ring-1 ring-[#e5d9cb]",
  },
  {
    title: "투어·티켓",
    description: "현지 필수템",
    href: "/tours",
    icon: "tour",
    accent: "bg-[#f7edf2] text-[#7c5261] ring-1 ring-[#ead8df]",
  },
] as const;

function quickIcon(icon: (typeof QUICK_LINKS)[number]["icon"]) {
  const className = "h-[21px] w-[21px]";
  if (icon === "flight") return <PlaneIcon className={className} />;
  if (icon === "stay") return <BedIcon className={className} />;
  return <TicketIcon className={className} />;
}

export function QuickSearchLinks() {
  return (
    <section className="px-5">
      <div className="mb-3">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          개별로 찾아보기
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex min-h-[112px] flex-col rounded-[20px] border border-[#eadfd8] bg-white px-3 py-3.5 shadow-[0_10px_20px_rgba(88,67,55,0.045)] transition active:scale-[0.99]"
          >
            <span
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] ${item.accent}`}
            >
              {quickIcon(item.icon)}
            </span>
            <span className="whitespace-nowrap text-[12.5px] font-black leading-4 tracking-[-0.05em] text-[#2c211d]">
              {item.title}
            </span>
            <span className="mt-1 text-[10px] font-semibold leading-3 tracking-[-0.03em] text-[#7f716b]">
              {item.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
