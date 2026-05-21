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
    return "bg-[#fff0eb] text-[#f05f5b] ring-1 ring-[#f6d6cc]";
  }

  if (slug.includes("osaka")) {
    return "bg-[#fff3e8] text-[#eb6b52] ring-1 ring-[#f3dacd]";
  }

  if (slug.includes("onsen")) {
    return "bg-[#fff0f4] text-[#df6577] ring-1 ring-[#f2d3dc]";
  }

  return "bg-[#fff0eb] text-[#f05f5b] ring-1 ring-[#f6d6cc]";
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
            className="group relative min-h-[100px] rounded-[22px] border border-[#f0e0d8] bg-white px-3.5 py-2.5 shadow-[0_12px_24px_rgba(115,72,59,0.06)] transition active:scale-[0.99]"
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
            <p className="mt-1 text-[12px] font-black tracking-[-0.04em] text-[#f05f5b]">
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
