// Moves one id a step up or down in the slider order. Returns the new order,
// or the same order when the move is not possible (first item up, last item down, unknown id).
export function moveInOrder(ids: string[], id: string, dir: "up" | "down"): string[] {
  const from = ids.indexOf(id);
  const to = dir === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

// Gaps of 10 leave room to insert without renumbering everything.
export const orderValue = (index: number) => (index + 1) * 10;
