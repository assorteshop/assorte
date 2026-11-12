"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  slug: string;
  name: string;
  price_uah: number;
  image: string | null;
  qty: number;
  /** Extra lines for the order comment, for example «Підказки для долі» of a «Жереб». */
  note?: string;
  /** This item can be paid only by card on the site («Жереб»). */
  cardOnly?: boolean;
};

const KEY = "assorte-cart-v1";
const MAX_QTY = 20;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const isItem = (x: unknown): x is CartItem => {
  const i = x as CartItem;
  return (
    !!i &&
    typeof i.slug === "string" &&
    typeof i.name === "string" &&
    Number.isFinite(i.price_uah) &&
    Number.isInteger(i.qty) &&
    i.qty > 0 &&
    (i.note === undefined || typeof i.note === "string") &&
    (i.cardOnly === undefined || typeof i.cardOnly === "boolean")
  );
};

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(parsed)) items = parsed.filter(isItem);
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next.length ? next : EMPTY;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable (private mode); the cart still works for this tab.
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  loaded = false;
  load();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return items;
};
const getServerSnapshot = () => EMPTY;

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  load();
  const existing = items.find((i) => i.slug === item.slug);
  commit(
    existing
      ? items.map((i) =>
          // The same «Жереб» added again keeps the latest hints.
          i.slug === item.slug
            ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY), ...(item.note !== undefined ? { note: item.note } : {}) }
            : i,
        )
      : [...items, { ...item, qty: Math.min(qty, MAX_QTY) }],
  );
}

export function setQty(slug: string, qty: number) {
  load();
  if (qty < 1) return removeFromCart(slug);
  commit(items.map((i) => (i.slug === slug ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)));
}

export function removeFromCart(slug: string) {
  load();
  commit(items.filter((i) => i.slug !== slug));
}

export function clearCart() {
  commit(EMPTY);
}

export function useCart() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    items: list,
    count: list.reduce((n, i) => n + i.qty, 0),
    total: list.reduce((n, i) => n + i.qty * i.price_uah, 0),
  };
}
