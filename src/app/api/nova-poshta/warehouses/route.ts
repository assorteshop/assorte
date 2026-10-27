import { listWarehouses } from "@/lib/nova-poshta";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const city = (params.get("city") ?? "").trim();
  const q = (params.get("q") ?? "").trim().slice(0, 60);
  if (!/^[0-9a-f-]{36}$/i.test(city)) return Response.json({ warehouses: [] });
  try {
    return Response.json({ warehouses: await listWarehouses(city, q) });
  } catch (error) {
    console.error("[assorte] nova poshta warehouses failed:", error);
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
