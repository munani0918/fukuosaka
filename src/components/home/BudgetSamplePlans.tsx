import Link from "next/link";

import type { BudgetTemplate } from "@/src/data/budgetTemplates";
import {
  ChevronRightIcon,
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

export function BudgetSamplePlans({ items }: BudgetSamplePlansProps) {
  return (
    <section className="px-5">
      <div className="mb-3">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          이 예산이면 이렇게 다녀올 수 있어요
        </h2>
        <p className="mt-1 text-[12px] font-semibold tracking-[-0.03em] text-[#8d7c74]">
          1인 기준 대표 샘플 플랜이에요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/budget-plans/${item.slug}`}
            className="group relative min-h-[104px] rounded-[22px] border border-[#f0e0d8] bg-white px-3.5 py-2 shadow-[0_12px_24px_rgba(115,72,59,0.06)] transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px] bg-[#fff0eb] text-[#f05f5b]">
                {planIcon(item.icon)}
              </span>
              <ChevronRightIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-[#b9a8a0] transition group-hover:translate-x-0.5" />
            </div>

            <h3 className="mt-2 whitespace-nowrap text-[14px] font-black leading-5 tracking-[-0.05em] text-[#2c211d]">
              {item.miniTitle}
            </h3>
            <p className="mt-1 text-[12px] font-black tracking-[-0.04em] text-[#f05f5b]">
              {item.miniBudgetLabel}
            </p>
            <p className="mt-1 text-[11px] font-semibold tracking-[-0.03em] text-[#8d7c74]">
              {item.miniDescription}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
