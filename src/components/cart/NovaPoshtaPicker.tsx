"use client";

import { useEffect, useRef, useState } from "react";

type City = { ref: string; name: string };
type Warehouse = { ref: string; name: string };

const field =
  "mt-1.5 h-12 w-full rounded-[4px] border border-line bg-white px-4 text-[14px]";
const label = "block text-[13px]";

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// City autocomplete, then the branches and parcel lockers of that city.
// Submits the same `city` and `address` fields as the manual inputs.
// If Nova Poshta cannot be reached, falls back to plain text inputs.
export function NovaPoshtaPicker() {
  const [cityText, setCityText] = useState("");
  const [city, setCity] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [warehouseText, setWarehouseText] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouse, setWarehouse] = useState("");
  const [loadedKey, setLoadedKey] = useState("");
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const cityQuery = useDebounced(cityText);
  const warehouseQuery = useDebounced(warehouseText);

  useEffect(() => {
    if (city || cityQuery.trim().length < 2) return;
    const ctrl = new AbortController();
    fetch(`/api/nova-poshta/cities?q=${encodeURIComponent(cityQuery.trim())}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d: { cities: City[] }) => {
        setCities(d.cities);
        setListOpen(true);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => ctrl.abort();
  }, [cityQuery, city]);

  useEffect(() => {
    if (!city) return;
    const ctrl = new AbortController();
    const key = `${city.ref}|${warehouseQuery.trim()}`;
    fetch(
      `/api/nova-poshta/warehouses?city=${city.ref}&q=${encodeURIComponent(warehouseQuery.trim())}`,
      { signal: ctrl.signal },
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d: { warehouses: Warehouse[] }) => {
        setWarehouses(d.warehouses);
        setLoadedKey(key);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => ctrl.abort();
  }, [city, warehouseQuery]);

  const loading = !!city && loadedKey !== `${city.ref}|${warehouseQuery.trim()}`;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setListOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (failed) {
    return (
      <>
        <label className={label}>
          Місто
          <input name="city" required autoComplete="address-level2" className={field} />
        </label>
        <label className={label}>
          Відділення або поштомат
          <input name="address" required placeholder="Наприклад: відділення №12" className={field} />
        </label>
      </>
    );
  }

  const pickCity = (c: City) => {
    setCity(c);
    setCityText(c.name);
    setListOpen(false);
    setWarehouse("");
    setWarehouseText("");
    setWarehouses([]);
  };

  return (
    <>
      <div ref={box} className="relative">
        <label className={label}>
          Місто
          <input
            required
            value={cityText}
            autoComplete="off"
            placeholder="Почніть вводити назву, наприклад: Дніпро"
            onChange={(e) => {
              setCityText(e.target.value);
              setCity(null);
              setWarehouse("");
              setWarehouses([]);
            }}
            onFocus={() => cities.length > 0 && !city && setListOpen(true)}
            className={field}
          />
        </label>
        <input type="hidden" name="city" value={city?.name ?? ""} />
        {listOpen && !city && cities.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-[4px] border border-line bg-white py-1 text-[14px] shadow-sm"
          >
            {cities.map((c) => (
              <li key={c.ref}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => pickCity(c)}
                  className="block w-full px-4 py-2.5 text-left hover:bg-ivory"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {!city && cityText.trim().length >= 2 && (
          <p className="mt-1.5 text-[12px] text-muted">Оберіть місто зі списку.</p>
        )}
      </div>

      {city && (
        <div className="space-y-3">
          <label className={label}>
            Пошук відділення (номер або вулиця)
            <input
              value={warehouseText}
              onChange={(e) => setWarehouseText(e.target.value)}
              placeholder="Необовʼязково, щоб швидше знайти"
              className={field}
            />
          </label>
          <label className={label}>
            Відділення або поштомат
            <select
              name="address"
              required
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className={field}
            >
              <option value="">
                {loading ? "Завантажуємо…" : warehouses.length ? "Оберіть відділення" : "Нічого не знайдено"}
              </option>
              {warehouses.map((w) => (
                <option key={w.ref} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          {warehouses.length === 50 && (
            <p className="text-[12px] text-muted">Показано перші 50. Уточніть пошук, щоб знайти потрібне.</p>
          )}
        </div>
      )}
    </>
  );
}
