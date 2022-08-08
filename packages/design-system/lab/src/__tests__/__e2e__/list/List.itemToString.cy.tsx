import { itemToString } from "../../../common-hooks/itemToString";

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

describe("defaultItemToString", () => {
  it("supports all data types", () => {
    for (let [input, expectedOutput] of testCases) {
      expect(itemToString(input)).to.eq(expectedOutput);
    }
  });
});
