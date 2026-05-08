import type { WeatherCardData, WeatherTone } from "@/src/data/home";
import { Artwork } from "@/src/components/home/Artwork";
import { CloudIcon, SunIcon } from "@/src/components/home/icons";

type WeatherSectionProps = {
  items: WeatherCardData[];
};

function toneIcon(tone: WeatherTone) {
  if (tone === "sunny") return <SunIcon className="h-3.5 w-3.5" />;
  return <CloudIcon className="h-3.5 w-3.5" />;
}

function currentIcon(condition: string) {
  if (condition.includes("맑")) {
    return <SunIcon className="h-7 w-7 text-[#f4b647]" />;
  }

  return <CloudIcon className="h-7 w-7 text-[#ef7c6d]" />;
}

export function WeatherSection({ items }: WeatherSectionProps) {
  return (
    <section className="px-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          오사카 · 후쿠오카 현재 날씨
        </h2>
        <p className="shrink-0 text-[11px] font-semibold text-[#a18f87]">
          실시간 기준
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="relative min-h-[148px] overflow-hidden rounded-[22px] border border-[#f1e4dc] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f4_100%)] px-3.5 pb-3.5 pt-3.5 shadow-[0_12px_24px_rgba(85,45,31,0.05)]"
          >
            <div className="absolute inset-x-0 bottom-0 h-14 opacity-[0.08]">
              <Artwork variant={item.artVariant} className="h-full w-full" />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[15px] font-bold leading-5 text-[#2c221d]">
                    {item.city}
                  </p>
                  <div className="mt-1.5 text-[28px] font-black leading-none tracking-[-0.05em] text-[#2c221d]">
                    {item.currentTemp}도
                  </div>
                </div>
                <span className="text-[#8a7d76]">{currentIcon(item.condition)}</span>
              </div>

              <p className="mt-2 text-[14px] font-bold leading-5 text-[#2c221d]">
                {item.condition}
              </p>
              <p className="mt-1 text-[12px] font-medium leading-4 text-[#7b6f68]">
                최고 {item.high}도 · 최저 {item.low}도
              </p>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {item.forecast.map((forecast) => (
                  <div
                    key={`${item.id}-${forecast.day}`}
                    className="rounded-[12px] bg-white px-2 py-1.5 text-center ring-1 ring-[#f2e5de]"
                  >
                    <div className="flex items-center justify-center gap-1 text-[#8c7d74]">
                      {toneIcon(forecast.tone)}
                      <span className="text-[11px] font-semibold">
                        {forecast.day}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-[#2c221d]">
                      {forecast.high} / {forecast.low}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
