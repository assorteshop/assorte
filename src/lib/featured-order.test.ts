import { describe, expect, it } from "vitest";
import { moveInOrder, moveToPosition, orderValue } from "./featured-order";

describe("moveInOrder", () => {
  const ids = ["a", "b", "c"];
  it("moves an item up and down", () => {
    expect(moveInOrder(ids, "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveInOrder(ids, "b", "down")).toEqual(["a", "c", "b"]);
  });
  it("moves an item straight to the first or last place", () => {
    const five = ["a", "b", "c", "d", "e"];
    expect(moveInOrder(five, "e", "top")).toEqual(["e", "a", "b", "c", "d"]);
    expect(moveInOrder(five, "a", "bottom")).toEqual(["b", "c", "d", "e", "a"]);
  });
  it("does nothing at the ends or for an unknown id", () => {
    expect(moveInOrder(ids, "a", "up")).toEqual(ids);
    expect(moveInOrder(ids, "c", "down")).toEqual(ids);
    expect(moveInOrder(ids, "a", "top")).toEqual(ids);
    expect(moveInOrder(ids, "x", "up")).toEqual(ids);
  });
  it("does not change the input", () => {
    moveInOrder(ids, "b", "up");
    expect(ids).toEqual(["a", "b", "c"]);
  });
});

describe("moveToPosition", () => {
  const ids = ["a", "b", "c", "d", "e"];
  it("puts an item at the given place", () => {
    expect(moveToPosition(ids, "e", 2)).toEqual(["a", "e", "b", "c", "d"]);
    expect(moveToPosition(ids, "a", 3)).toEqual(["b", "c", "a", "d", "e"]);
  });
  it("clamps numbers past either end", () => {
    expect(moveToPosition(ids, "c", 0)).toEqual(["c", "a", "b", "d", "e"]);
    expect(moveToPosition(ids, "c", 99)).toEqual(["a", "b", "d", "e", "c"]);
  });
  it("ignores an unknown id or a non-number", () => {
    expect(moveToPosition(ids, "x", 1)).toEqual(ids);
    expect(moveToPosition(ids, "c", NaN)).toEqual(ids);
  });
});

describe("orderValue", () => {
  it("steps by 10 from 10", () => {
    expect([0, 1, 2].map(orderValue)).toEqual([10, 20, 30]);
  });
});
