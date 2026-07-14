import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "FUKUOSAKA | 후쿠오카·오사카 예산플래너",
  description:
    "후쿠오카·오사카 여행 예산을 입력하면 항공, 숙소, 투어를 예산에 맞게 추천하는 예산플래너 홈 화면입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#8f161b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-dvh" suppressHydrationWarning>
        {children}
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
