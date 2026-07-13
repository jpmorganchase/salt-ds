import { describe, expect, it, vi } from "vitest";
import { getInputValueAfterSelection } from "../../../combo-box/useComboBox";
import type { OptionValue } from "../../../list-control/ListControlContext";
import { findOptionFromSearch } from "../../../list-control/ListControlState";

const option = <Item>(id: string, value: Item, disabled = false) => ({
  data: { id, value, disabled } satisfies OptionValue<Item>,
});

describe("getInputValueAfterSelection", () => {
  it("converts only the selected option for single select", () => {
    const selected = option("selected", "Selected").data;
    const valueToString = vi.fn((value: string) => value);

    expect(getInputValueAfterSelection(selected, false, valueToString)).toBe(
      "Selected",
    );
    expect(valueToString).toHaveBeenCalledTimes(1);
    expect(valueToString).toHaveBeenCalledWith("Selected");
  });

  it("does not inspect or convert a 10k registry for multiselect", () => {
    const options = Array.from({ length: 10_000 }, (_, index) =>
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
    const selected = measuredOptions[9_999].data;
    indexedReads = 0;
    const valueToString = vi.fn((value: string) => value);

    expect(getInputValueAfterSelection(selected, true, valueToString)).toBe("");
    expect(indexedReads).toBe(0);
    expect(valueToString).not.toHaveBeenCalled();
  });
});

const values = (...items: string[]) =>
  items.map((item, index) => option(String(index), item));

describe("findOptionFromSearch", () => {
  it("finds from the start and starts after a matching active value", () => {
    const options = values("Alabama", "Alaska", "Arizona");
    expect(findOptionFromSearch(options, "al", String)).toBe(options[0].data);
    expect(findOptionFromSearch(options, "al", String, options[0].data)).toBe(
      options[1].data,
    );
  });

  it("wraps once after the active option", () => {
    const options = values("Alabama", "Colorado", "Delaware");
    expect(findOptionFromSearch(options, "a", String, options[2].data)).toBe(
      options[0].data,
    );
  });

  it("keeps first-value identity semantics for duplicate values", () => {
    const first = option("first", "Alabama");
    const duplicate = option("duplicate", "Alabama");
    const later = option("later", "Alaska");
    expect(
      findOptionFromSearch([first, duplicate, later], "a", String, first.data),
    ).toBe(later.data);
    expect(
      findOptionFromSearch([first, duplicate], "a", String, duplicate.data),
    ).toBe(first.data);
  });

  it("cycles repeated characters and retains disabled matches", () => {
    const options = [option("a", "Alabama"), option("b", "Alaska", true)];
    expect(findOptionFromSearch(options, "aa", String, options[0].data)).toBe(
      options[1].data,
    );
    expect(findOptionFromSearch(options, "al", String)).toBe(options[0].data);
  });

  it("returns undefined for no match and preserves NaN behavior", () => {
    expect(
      findOptionFromSearch(values("Alabama"), "z", String),
    ).toBeUndefined();
    const nan = option("nan", Number.NaN);
    expect(findOptionFromSearch([nan], "n", String)).toBeUndefined();
  });

  it("uses strict object reference identity", () => {
    const firstValue = { label: "Alabama" };
    const equalValue = { label: "Alabama" };
    const options = [option("first", firstValue), option("equal", equalValue)];
    expect(
      findOptionFromSearch(
        options,
        "a",
        (value) => value.label,
        options[0].data,
      ),
    ).toBe(options[1].data);
  });

  it("calls valueToString at most once per option for 10k options", () => {
    const options = Array.from({ length: 10_000 }, (_, index) =>
      option(String(index), `Item ${index}`),
    );
    const valueToString = vi.fn((value: string) => String(value));

    expect(
      findOptionFromSearch(options, "missing", valueToString),
    ).toBeUndefined();
    expect(valueToString).toHaveBeenCalledTimes(10_000);
  });
});
