import { getDefaultFilter } from "../../combo-box";

describe("filterHelpers", () => {
  describe("getDefaultFilter", () => {
    it.each`
      inputValue    | itemValue           | matches
      ${undefined}  | ${undefined}        | ${false}
      ${undefined}  | ${""}               | ${false}
      ${""}         | ${""}               | ${false}
      ${"ca"}       | ${"california"}     | ${true}
      ${"ca"}       | ${"CALIFORNIA"}     | ${true}
      ${"ca"}       | ${"north carolina"} | ${true}
      ${"ca"}       | ${"Lancashire"}     | ${true}
      ${"ca"}       | ${"South Africa"}   | ${true}
      ${" south"}   | ${"South Africa"}   | ${true}
      ${" south "}  | ${"South Africa"}   | ${true}
      ${" south  "} | ${"South Africa"}   | ${false}
    `(
      'should return matches $matches for inputValue = "$inputValue" and itemValue = "$itemValue"',
      ({ inputValue, itemValue, matches }) => {
        const filter = getDefaultFilter(inputValue);

        expect(filter(itemValue)).toEqual(matches);
      }
    );
  });
});
