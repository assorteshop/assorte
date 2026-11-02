import { describe, expect, it } from "vitest";
import { moveInOrder, orderValue } from "./featured-order";

describe("moveInOrder", () => {
  const ids = ["a", "b", "c"];
  it("moves an item up and down", () => {
    expect(moveInOrder(ids, "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveInOrder(ids, "b", "down")).toEqual(["a", "c", "b"]);
  });
  it("does nothing at the ends or for an unknown id", () => {
    expect(moveInOrder(ids, "a", "up")).toEqual(ids);
    expect(moveInOrder(ids, "c", "down")).toEqual(ids);
    expect(moveInOrder(ids, "x", "up")).toEqual(ids);
  });
  it("does not change the input", () => {
    moveInOrder(ids, "b", "up");
    expect(ids).toEqual(["a", "b", "c"]);
  });
});

describe("orderValue", () => {
  it("steps by 10 from 10", () => {
    expect([0, 1, 2].map(orderValue)).toEqual([10, 20, 30]);
  });
});
