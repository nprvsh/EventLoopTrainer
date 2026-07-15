import { describe, expect, it } from "vitest";
import { pick, rnd, shuffle } from ".";

describe("rnd", () => {
  it("returns integers in [0, n)", () => {
    for (let i = 0; i < 200; i++) {
      const value = rnd(5);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(5);
    }
  });
});

describe("pick", () => {
  it("returns an element of the array", () => {
    const items = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(pick(items));
    }
  });
});

describe("shuffle", () => {
  it("returns a permutation without mutating the input", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...items];
    const shuffled = shuffle(items);
    expect(items).toEqual(copy);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
  });
});
