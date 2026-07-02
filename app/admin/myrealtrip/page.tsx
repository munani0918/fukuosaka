import type { Metadata } from "next";

import { MyRealTripAdminClient } from "./MyRealTripAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "마이리얼트립 운영 | FUKUOSAKA",
  robots: { index: false, follow: false },
};

export default function MyRealTripAdminPage() {
  return <MyRealTripAdminClient />;
}
