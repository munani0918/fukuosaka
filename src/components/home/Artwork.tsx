import type { HomeArtVariant } from "@/src/data/home";

type ArtworkProps = {
  variant: HomeArtVariant;
  className?: string;
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function HotelWindow({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "absolute rounded-[10px] border border-white/40 bg-[linear-gradient(180deg,#d9c2a8_0%,#bd8e67_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
        className,
      )}
    />
  );
}

function SkylineBar({ className }: { className?: string }) {
  return <div className={cx("absolute bottom-0 rounded-t-[16px]", className)} />;
}

export function Artwork({ variant, className }: ArtworkProps) {
  if (variant === "weather-osaka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff8f0_0%,#fff2e4_100%)]" />
        <div className="absolute right-5 top-4 h-12 w-12 rounded-full bg-[#ffbf3b]" />
        <div className="absolute right-3 top-2 h-16 w-16 rounded-full bg-[#ffd978]/40 blur-md" />
        <div className="absolute bottom-2 left-4 h-12 w-14">
          <div className="absolute bottom-0 left-0 right-0 h-2 rounded-full bg-[#f4cab8]/80" />
          <div className="absolute bottom-2 left-3 h-6 w-8 rounded-t-[10px] bg-[#f2baa2]" />
          <div className="absolute bottom-8 left-5 h-3 w-4 rounded-t-[6px] bg-[#f2baa2]" />
          <div className="absolute bottom-[44px] left-[26px] h-2 w-[2px] rounded-full bg-[#f2baa2]" />
        </div>
        <SkylineBar className="left-[80px] h-5 w-4 bg-[#f7d6c8]" />
        <SkylineBar className="left-[96px] h-7 w-5 bg-[#f4ccb9]" />
        <SkylineBar className="left-[120px] h-10 w-6 bg-[#f6d9cd]" />
        <SkylineBar className="left-[152px] h-6 w-4 bg-[#f3c9b7]" />
      </div>
    );
  }

  if (variant === "weather-fukuoka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff9f6_0%,#fff3ed_100%)]" />
        <div className="absolute right-5 top-6 h-10 w-14 rounded-full bg-[#d9dce7]" />
        <div className="absolute right-1 top-8 h-12 w-16 rounded-full bg-[#eef0f5]" />
        <div className="absolute right-9 top-3 h-8 w-8 rounded-full bg-[#f5f7fb]" />
        <SkylineBar className="left-5 h-4 w-5 bg-[#f5d7cc]" />
        <SkylineBar className="left-12 h-7 w-6 bg-[#f6d5c7]" />
        <SkylineBar className="left-[80px] h-5 w-4 bg-[#f5cfc0]" />
        <SkylineBar className="left-[104px] h-9 w-6 bg-[#f6d9cf]" />
        <SkylineBar className="left-[136px] h-6 w-4 bg-[#f2c7b9]" />
      </div>
    );
  }

  if (variant === "flight-fukuoka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#3b2f9d_0%,#6d53ca_55%,#fc7f44_100%)]" />
        <div className="absolute right-2 top-2 h-12 w-12 rounded-full bg-white/25 blur-md" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-[linear-gradient(180deg,transparent_0%,rgba(18,10,55,0.95)_100%)]" />
        <SkylineBar className="left-3 h-10 w-6 bg-[#1f104d]" />
        <SkylineBar className="left-10 h-14 w-6 bg-[#24115c]" />
        <SkylineBar className="left-[72px] h-[72px] w-4 bg-[#24115c]" />
        <div className="absolute bottom-0 left-[70px] h-[68px] w-5 rounded-t-[10px] bg-[#29126a]" />
        <div className="absolute bottom-[52px] left-[74px] h-5 w-2 rounded-full bg-[#29126a]" />
        <SkylineBar className="right-8 h-12 w-5 bg-[#2e1a6d]" />
        <SkylineBar className="right-3 h-8 w-4 bg-[#24115c]" />
      </div>
    );
  }

  if (variant === "flight-osaka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(150deg,#ffe4c4_0%,#f8b996_40%,#7c2c2b_100%)]" />
        <div className="absolute left-2 top-3 h-16 w-16 rounded-full bg-white/25 blur-lg" />
        <div className="absolute bottom-0 left-2 h-11 w-12">
          <div className="absolute bottom-0 left-0 right-0 h-2 rounded-full bg-[#5f1f1f]/70" />
          <div className="absolute bottom-2 left-2 h-6 w-8 rounded-t-[8px] bg-[#5b2020]" />
          <div className="absolute bottom-8 left-3 h-4 w-6 rounded-t-[5px] bg-[#5b2020]" />
          <div className="absolute bottom-11 left-5 h-3 w-2 rounded-full bg-[#5b2020]" />
        </div>
        <div className="absolute bottom-1 right-4 h-3 w-3 rounded-full bg-[#d45042]" />
        <div className="absolute bottom-5 right-7 h-2 w-2 rounded-full bg-[#efb0a2]" />
        <div className="absolute bottom-8 right-3 h-3 w-3 rounded-full bg-[#f7c6b8]" />
        <SkylineBar className="bottom-0 left-16 h-5 w-4 bg-[#5a2224]" />
        <SkylineBar className="bottom-0 left-[84px] h-8 w-5 bg-[#64272a]" />
        <SkylineBar className="bottom-0 left-28 h-6 w-4 bg-[#5d2124]" />
      </div>
    );
  }

  if (variant === "stay-osaka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#d6e5f5_0%,#ecd2bc_52%,#efe8df_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-12 bg-[linear-gradient(180deg,rgba(255,255,255,0.48)_0%,transparent_100%)]" />
        <HotelWindow className="right-4 top-5 h-[70px] w-14" />
        <div className="absolute right-7 top-8 h-5 w-9 rounded-full bg-[#bad9ef]" />
        <div className="absolute bottom-8 left-6 h-[62px] w-[78px] rounded-[18px] bg-[#b88460]" />
        <div className="absolute bottom-12 left-8 h-7 w-[70px] rounded-[12px] bg-white/88" />
        <div className="absolute bottom-8 left-5 h-4 w-5 rounded-t-[6px] bg-[#9f6e4e]" />
        <div className="absolute bottom-8 left-[108px] h-4 w-5 rounded-t-[6px] bg-[#9f6e4e]" />
        <div className="absolute bottom-5 left-0 right-0 h-9 bg-[#ebe2d8]" />
      </div>
    );
  }

  if (variant === "stay-fukuoka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#d8e7f3_0%,#efe1d1_52%,#f5f1ec_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,transparent_100%)]" />
        <HotelWindow className="left-6 top-6 h-14 w-12" />
        <div className="absolute left-8 top-8 h-4 w-6 rounded-full bg-[#bfd9ea]" />
        <div className="absolute bottom-9 left-8 h-[60px] w-[80px] rounded-[20px] bg-[#8d5f45]" />
        <div className="absolute bottom-12 left-10 h-7 w-[74px] rounded-[14px] bg-[#fff8ef]" />
        <div className="absolute bottom-8 left-[96px] h-[72px] w-10 rounded-t-[16px] bg-[#c89b73]" />
        <div className="absolute bottom-6 left-0 right-0 h-8 bg-[#efe8de]" />
      </div>
    );
  }

  if (variant === "tour-osaka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#abd4ff_0%,#f3d7da_100%)]" />
        <div className="absolute left-4 top-5 h-6 w-6 rounded-full bg-[#ffc95f]" />
        <div className="absolute bottom-2 left-4 h-16 w-16">
          <div className="absolute bottom-0 left-2 right-2 h-2 rounded-full bg-[#5c2c32]/70" />
          <div className="absolute bottom-2 left-4 h-6 w-8 rounded-t-[10px] bg-[#5f2f35]" />
          <div className="absolute bottom-8 left-5 h-5 w-6 rounded-t-[6px] bg-[#5f2f35]" />
          <div className="absolute bottom-12 left-[26px] h-4 w-3 rounded-full bg-[#5f2f35]" />
        </div>
        <div className="absolute bottom-3 right-5 h-4 w-4 rounded-full bg-[#f9c3cf]" />
        <div className="absolute bottom-9 right-8 h-3 w-3 rounded-full bg-[#ffd5df]" />
        <div className="absolute bottom-6 right-2 h-3 w-3 rounded-full bg-[#f7c0cf]" />
      </div>
    );
  }

  if (variant === "tour-fukuoka") {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#b7def5_0%,#d5efe9_55%,#f4e1d4_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#5aa2b5]" />
        <div className="absolute bottom-5 left-[80px] h-5 w-10 rounded-full bg-[#5a3f31]" />
        <div className="absolute bottom-8 left-[96px] h-4 w-1 rounded-full bg-[#5a3f31]" />
        <SkylineBar className="bottom-8 left-5 h-7 w-5 bg-[#d4b8a9]" />
        <SkylineBar className="bottom-8 left-11 h-11 w-6 bg-[#b8d0df]" />
        <SkylineBar className="bottom-8 left-[72px] h-8 w-5 bg-[#d7bfaf]" />
        <SkylineBar className="bottom-8 right-8 h-[52px] w-6 bg-[#c6d9e3]" />
        <SkylineBar className="bottom-8 right-2 h-7 w-5 bg-[#d4b8a9]" />
      </div>
    );
  }

  return (
    <div className={cx("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff0e8_0%,#ffd7ca_100%)]" />
      <div className="absolute left-0 right-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.48)_0%,transparent_100%)]" />
      <div className="absolute right-3 top-3 h-14 w-14 rounded-full bg-white/28 blur-md" />
      <div className="absolute bottom-5 left-4 h-11 w-16 rounded-[14px] border border-white/45 bg-white/45" />
      <div className="absolute bottom-12 left-14 h-9 w-7 rounded-t-[8px] bg-[#d58b73]/72" />
      <div className="absolute bottom-6 right-5 h-[42px] w-[50px] rounded-[12px] border border-[#f4b7a7]/65 bg-[#ffefe7]/78" />
      <div className="absolute bottom-9 right-7 h-[2px] w-6 bg-[#f09d90]" />
      <div className="absolute bottom-13 right-7 h-[2px] w-8 bg-[#f3b4a7]" />
      <div className="absolute bottom-4 right-4 h-3 w-3 rounded-full bg-[#f6bbc6]" />
      <div className="absolute bottom-10 right-8 h-4 w-4 rounded-full bg-[#ffd8de]" />
      <div className="absolute bottom-6 right-12 h-2.5 w-2.5 rounded-full bg-[#ffe5ea]" />
    </div>
  );
}
