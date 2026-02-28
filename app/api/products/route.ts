import { getCachedProducts } from "@/lib/api-server";

export async function GET() {
  const { data } = await getCachedProducts({ limit: 100 });
  return Response.json(
    { data },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
