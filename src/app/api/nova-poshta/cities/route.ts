import { searchCities } from "@/lib/nova-poshta";

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return Response.json({ cities: [] });
  try {
    return Response.json({ cities: await searchCities(q) });
  } catch (error) {
    console.error("[assorte] nova poshta cities failed:", error);
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
