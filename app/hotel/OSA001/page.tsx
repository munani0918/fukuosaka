import { notFound } from "next/navigation";
import { hotels } from "@/src/data/hotels";
import HotelDetailTemplate from "@/src/components/hotel/HotelDetailTemplate";
import { buildMylinkUrl } from "@/src/lib/myrealtrip";

// Server Component — MYREALTRIP_MYLINK_ID는 서버에서만 읽히고 클라이언트에 노출되지 않는다.
export default function Page() {
  const hotel = hotels.find((h) => h.detail?.code === "OSA001");
  if (!hotel) notFound();

  // 마이리얼트립 버튼 1개에만 mylink URL 적용 (URL 파라미터 방식)
  // MYREALTRIP_MYLINK_ID 없으면 원본 targetUrl 그대로 사용 (graceful fallback)
  const { url: mylinkUrl } = buildMylinkUrl({
    targetUrl: "https://accommodation.myrealtrip.com/union/products/1101376?checkIn=2026-06-28&checkOut=2026-06-29&adultCount=2&childCount=0&isDomestic=false&providerRoomId=&segment=&childAges=",
    utmContent: "OSA001-detail-myrealtrip",
  });

  const hotelWithMylink = {
    ...hotel,
    partnerLinks: {
      ...hotel.partnerLinks,
      myrealtrip: mylinkUrl,
    },
  };

  return <HotelDetailTemplate hotel={hotelWithMylink} />;
}
