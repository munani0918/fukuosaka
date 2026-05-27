export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.GOOGLE_MAPS_EMBED_API_KEY?.trim();

  return Response.json(
    key ? { enabled: true, key } : { enabled: false },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
