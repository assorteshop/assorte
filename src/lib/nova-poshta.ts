import "server-only";

const ENDPOINT = "https://api.novaposhta.ua/v2.0/json/";

export type NpCity = { ref: string; name: string };
export type NpWarehouse = { ref: string; name: string };

async function call<T>(modelName: string, calledMethod: string, methodProperties: object): Promise<T[]> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: process.env.NOVA_POSHTA_API_KEY ?? "",
      modelName,
      calledMethod,
      methodProperties,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Nova Poshta HTTP ${res.status}`);
  const json = (await res.json()) as { success: boolean; data: T[]; errors?: string[] };
  if (!json.success) throw new Error(`Nova Poshta: ${(json.errors ?? []).join("; ")}`);
  return json.data;
}

export async function searchCities(query: string): Promise<NpCity[]> {
  type Row = { Addresses: { Present: string; DeliveryCity: string; Warehouses: number }[] };
  const data = await call<Row>("Address", "searchSettlements", {
    CityName: query,
    Limit: "8",
    Page: "1",
  });
  return (data[0]?.Addresses ?? [])
    .filter((a) => a.Warehouses > 0 && a.DeliveryCity)
    .map((a) => ({ ref: a.DeliveryCity, name: a.Present }));
}

export async function listWarehouses(cityRef: string, query: string): Promise<NpWarehouse[]> {
  type Row = { Ref: string; Description: string };
  const data = await call<Row>("Address", "getWarehouses", {
    CityRef: cityRef,
    FindByString: query,
    Limit: "50",
    Page: "1",
    Language: "UA",
  });
  return data.map((w) => ({ ref: w.Ref, name: w.Description }));
}
