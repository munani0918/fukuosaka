import type { HeroData } from "@/src/data/home";
import { PlannerEntryButton } from "@/src/components/home/PlannerEntryButton";
import {
  ArrowRightIcon,
  CoinsIcon,
  PlaneIcon,
  SparklesIcon,
} from "@/src/components/home/icons";

type HeroSectionProps = {
  hero: HeroData;
};

function tagIcon(label: "plane" | "coins" | "sparkles") {
  if (label === "plane") return <PlaneIcon className="h-3 w-3" />;
  if (label === "coins") return <CoinsIcon className="h-3 w-3" />;
  return <SparklesIcon className="h-3 w-3" />;
}

function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-right"
        style={{
          backgroundImage: "url('/images/hero-osaka-landmarks.webp')",
          backgroundPosition: "right center",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,242,0.98)_0%,rgba(255,248,242,0.94)_42%,rgba(255,231,221,0.72)_68%,rgba(255,210,190,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(255,190,178,0.28)_0%,rgba(255,190,178,0.12)_34%,rgba(255,190,178,0)_62%)]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(255,241,235,0)_0%,rgba(255,229,221,0.34)_100%)]" />
    </div>
  );
}

export function HeroSection({ hero }: HeroSectionProps) {
  const subtitleLines = [
    "항공 · 숙소 · 투어를",
    "예산에 맞게 추천해드려요",
  ];

  return (
    <section className="mb-6 px-5 pt-3">
      <div className="relative overflow-hidden rounded-[30px] border border-[#f3e5dd] bg-[linear-gradient(145deg,#fffefd_0%,#fff6f0_46%,#f8e2dc_100%)] px-5 pb-4 pt-5 shadow-[0_18px_36px_rgba(138,42,45,0.12)]">
        <HeroBackdrop />

        <div className="relative z-10 min-h-[214px]">
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-[#f7d7cf] bg-white/95 px-3.5 text-[12px] font-bold text-[#f05f5b] shadow-[0_8px_16px_rgba(248,126,110,0.08)]">
            <PlaneIcon className="h-3.5 w-3.5" />
            {hero.eyebrow}
          </span>

          <h1 className="mt-5 text-[26px] font-black leading-[0.94] tracking-[-0.05em] text-[#f35f5b]">
            {hero.title}
          </h1>

          <div className="mt-2.5 space-y-0 text-[15px] font-bold leading-6 tracking-[-0.03em] text-[#2f2521]">
            {subtitleLines.map((line) => (
              <p key={line} className="max-w-[60%]">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-4 flex gap-1.5">
            {hero.tags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-full border border-[#f3e2da] bg-[rgba(255,255,255,0.86)] px-2.5 text-[10px] font-semibold tracking-[-0.03em] text-[#7e6f68] shadow-[0_8px_14px_rgba(114,72,58,0.05)] backdrop-blur-[6px]"
              >
                <span className="shrink-0">{tagIcon(tag.icon)}</span>
                <span>{tag.label}</span>
              </span>
            ))}
          </div>

          <PlannerEntryButton
            source="hero-cta"
            className="mt-4 inline-flex h-[50px] min-w-[164px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#ff6e65_0%,#f4514f_100%)] px-6 text-[15px] font-black text-white shadow-[0_12px_22px_rgba(244,89,85,0.26)] transition active:scale-[0.99]"
          >
            <span>{hero.ctaLabel}</span>
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </PlannerEntryButton>
        </div>
      </div>
    </section>
  );
}
