import { describe, expect, it } from "vitest";
import { itemToString } from "../../common-hooks/itemToString";

const testCases = [
  [null, "null"],
  [undefined, "undefined"],
  ["", ""],
  ["item", "item"],
  ["item", "item"],
  [{}, ""],
  [{ label: undefined }, "undefined"],
  [{ label: 1 }, "1"],
  [{ label: "item" }, "item"],
];

describe("itemToString", () => {
  it("supports all data types", () => {
    for (const [input, expectedOutput] of testCases) {
      expect(itemToString(input)).toBe(expectedOutput);
    }
  });
});
