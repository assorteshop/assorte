export type MoveDir = "up" | "down" | "top" | "bottom";

// Moves one id in the slider order: a step up/down, or straight to the first/last place.
// Returns the new order, or the same order when the move is not possible (unknown id, already there).
export function moveInOrder(ids: string[], id: string, dir: MoveDir): string[] {
  const from = ids.indexOf(id);
  if (from < 0) return ids;
  const to = { up: from - 1, down: from + 1, top: 0, bottom: ids.length - 1 }[dir];
  if (to < 0 || to >= ids.length) return ids;
  return moveToPosition(ids, id, to + 1);
}

// Puts one id at a 1-based place ("№ 2" = second); a number past either end means first/last place.
export function moveToPosition(ids: string[], id: string, position: number): string[] {
  const from = ids.indexOf(id);
  if (from < 0 || !Number.isFinite(position)) return ids;
  const to = Math.min(Math.max(Math.round(position), 1), ids.length) - 1;
  if (to === from) return ids;
  const next = ids.filter((x) => x !== id);
  next.splice(to, 0, id);
  return next;
}

// Gaps of 10 leave room to insert without renumbering everything.
export const orderValue = (index: number) => (index + 1) * 10;
