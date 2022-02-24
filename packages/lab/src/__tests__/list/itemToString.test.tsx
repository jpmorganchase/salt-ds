import { itemToString } from "../../list";

describe("defaultItemToString", () => {
  const originalWarn = console.warn;

  // We know there will be console warning for the {} test case. It is expected, so we mock it out.
  beforeEach(() => (console.warn = jest.fn()));
  afterEach(() => (console.warn = originalWarn));

  it.each`
    item                    | expected
    ${null}                 | ${"null"}
    ${undefined}            | ${"undefined"}
    ${""}                   | ${""}
    ${0}                    | ${"0"}
    ${"item"}               | ${"item"}
    ${{}}                   | ${""}
    ${{ label: undefined }} | ${"undefined"}
    ${{ label: 1 }}         | ${"1"}
    ${{ label: "item" }}    | ${"item"}
  `('should return "$expected" for item = "$item"', ({ item, expected }) => {
    expect(itemToString(item)).toEqual(expected);
  });
});
