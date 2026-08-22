import { describe, expect, it } from "vitest";
import { itemToString } from "../../packages/lab/src/common-hooks/itemToString";

describe("default itemToString", () => {
  it.each([
    [null, "null"],
    [undefined, "undefined"],
    ["", ""],
    ["item", "item"],
    [{}, ""],
    [{ label: undefined }, "undefined"],
    [{ label: 1 }, "1"],
    [{ label: "item" }, "item"],
  ])("converts %j to %s", (input, expectedOutput) => {
    expect(itemToString(input)).toBe(expectedOutput);
  });
});
