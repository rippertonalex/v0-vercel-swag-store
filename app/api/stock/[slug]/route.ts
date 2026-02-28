import { getProductStock } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const stock = await getProductStock(slug);
    return Response.json({ stock });
  } catch {
    return Response.json({ stock: null }, { status: 404 });
  }
}
