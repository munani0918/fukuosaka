import { notFound } from "next/navigation";
import { hotels } from "@/src/data/hotels";
import HotelDetailTemplate from "@/src/components/hotel/HotelDetailTemplate";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = hotels.find((h) => h.detail?.code === id);
  if (!hotel) notFound();
  return <HotelDetailTemplate hotel={hotel} />;
}
