import Link from "next/link";

import type { BudgetTemplate } from "@/src/data/budgetTemplates";
import {
  CoinsIcon,
  SparklesIcon,
  WalletIcon,
  CloudIcon,
} from "@/src/components/home/icons";

type BudgetSamplePlansProps = {
  items: BudgetTemplate[];
};

function planIcon(icon: BudgetTemplate["icon"]) {
  const className = "h-[18px] w-[18px]";
  if (icon === "wallet") return <WalletIcon className={className} />;
  if (icon === "sparkles") return <SparklesIcon className={className} />;
  if (icon === "coins") return <CoinsIcon className={className} />;
  return <CloudIcon className={className} />;
}

function planAccent(slug: string) {
  if (slug.includes("osaka") && slug.includes("budget")) {
    return "bg-[#fff0ea] text-[#9b5b48] ring-1 ring-[#f1d7ca]";
  }

  if (slug.includes("osaka")) {
    return "bg-[#fff4df] text-[#80633d] ring-1 ring-[#ead9b9]";
  }

  if (slug.includes("onsen")) {
    return "bg-[#eaf4ef] text-[#4f715f] ring-1 ring-[#d0e4d9]";
  }

  return "bg-[#f7edf0] text-[#86515e] ring-1 ring-[#ead5dc]";
}

export function BudgetSamplePlans({ items }: BudgetSamplePlansProps) {
  return (
    <section className="px-5">
      <div className="mb-3">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          예산별 추천 플랜
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/budget-plans/${item.slug}`}
            className="group relative min-h-[100px] rounded-[22px] border border-[#eadfd8] bg-white px-3.5 py-2.5 shadow-[0_10px_20px_rgba(88,67,55,0.05)] transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px] ${planAccent(
                  item.slug,
                )}`}
              >
                {planIcon(item.icon)}
              </span>
            </div>

            <h3 className="mt-2 whitespace-nowrap text-[14px] font-black leading-5 tracking-[-0.05em] text-[#2c211d]">
              {item.miniTitle}
            </h3>
            <p className="mt-1 text-[12px] font-extrabold tracking-[-0.04em] text-[#3a302b]">
              {item.miniBudgetLabel}
            </p>
            <p className="mt-1 text-[11px] font-semibold tracking-[-0.03em] text-[#86766f]">
              {item.miniDescription}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
