import { describe, expect, it } from "vitest";
import type { OptionValue } from "../../../list-control/ListControlContext";
import { findOptionFromSearch } from "../../../list-control/ListControlState";

type RegisteredOption = { data: OptionValue<string> };

const option = (
  id: string,
  value: string,
  disabled = false,
): RegisteredOption => ({
  data: { id, value, disabled },
});

const values = (...items: string[]) =>
  items.map((item, index) => option(String(index), item));

describe("findOptionFromSearch", () => {
  it("starts after a late active option and wraps to an earlier match", () => {
    const options = values("Alabama", "Alaska", "Arizona", "Colorado");

    expect(findOptionFromSearch(options, "al", String, options[2].data)).toBe(
      options[0].data,
    );
  });

  it("wraps from the final option", () => {
    const options = values("Alabama", "Colorado", "Delaware");

    expect(findOptionFromSearch(options, "c", String, options[2].data)).toBe(
      options[1].data,
    );
  });

  it("cycles by first character when the search repeats one character", () => {
    const options = values("Alabama", "Alaska", "Arizona");

    expect(findOptionFromSearch(options, "aa", String, options[0].data)).toBe(
      options[1].data,
    );
  });

  it("retains disabled matches and returns undefined when nothing matches", () => {
    const options = [option("a", "Alabama"), option("c", "Colorado", true)];

    expect(findOptionFromSearch(options, "c", String)).toBe(options[1].data);
    expect(findOptionFromSearch(options, "z", String)).toBeUndefined();
  });

  it("retains first-value identity semantics for duplicate values", () => {
    const first = option("first", "Alabama");
    const duplicate = option("duplicate", "Alabama");
    const laterMatch = option("later", "Alaska");
    const options = [first, duplicate, laterMatch];

    expect(findOptionFromSearch(options, "a", String, first.data)).toBe(
      laterMatch.data,
    );
    expect(
      findOptionFromSearch([first, duplicate], "a", String, duplicate.data),
    ).toBe(first.data);
  });

  it.each([32, 512])("reads a %i-option registry linearly", (size) => {
    const options = Array.from({ length: size }, (_, index) =>
      option(String(index), `Item ${index}`),
    );
    let indexedReads = 0;
    const measuredOptions = new Proxy(options, {
      get(target, property, receiver) {
        if (typeof property === "string" && /^\d+$/.test(property)) {
          indexedReads++;
        }
        return Reflect.get(target, property, receiver);
      },
    });

    expect(
      findOptionFromSearch(
        measuredOptions,
        "item",
        String,
        options[Math.floor(size / 2)].data,
      ),
    ).toBe(options[Math.floor(size / 2) + 1].data);
    expect(indexedReads).toBeLessThanOrEqual(size * 2 + 2);
  });
});
