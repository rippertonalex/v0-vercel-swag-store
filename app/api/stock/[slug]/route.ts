// Stock is intentionally dynamic per spec — short edge cache (10s) reduces
// redundant calls while staying real-time enough for inventory display.
import { getProductStock } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const stock = await getProductStock(slug);
    return Response.json(
      { stock },
      {
        headers: {
          "Cache-Control": "s-maxage=10, stale-while-revalidate=20",
        },
      },
    );
  } catch {
    return Response.json({ stock: null }, { status: 404 });
  }
}
