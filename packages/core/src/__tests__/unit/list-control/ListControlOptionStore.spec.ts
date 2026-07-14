import { describe, expect, it, vi } from "vitest";
import type { OptionValue } from "../../../list-control/ListControlContext";
import {
  ListControlOptionStore,
  OPTION_STATE_ACTIVE,
  OPTION_STATE_FOCUS_VISIBLE,
  OPTION_STATE_SELECTED,
} from "../../../list-control/ListControlOptionStore";

const option = <Item>(
  id: string,
  value: Item,
  disabled = false,
): OptionValue<Item> => ({ id, value, disabled });

describe("ListControlOptionStore", () => {
  it("returns stable primitive snapshots for active, selected, and focus-visible state", () => {
    const store = new ListControlOptionStore<string>(["two"]);
    store.register(option("one", "one"));
    store.register(option("two", "two"));

    expect(store.getSnapshot("one")).toBe(0);
    expect(store.getSnapshot("two")).toBe(OPTION_STATE_SELECTED);

    store.setActiveId("two");
    expect(store.getSnapshot("two")).toBe(
      OPTION_STATE_ACTIVE | OPTION_STATE_SELECTED,
    );

    store.setFocusVisible(true);
    expect(store.getSnapshot("two")).toBe(
      OPTION_STATE_ACTIVE | OPTION_STATE_SELECTED | OPTION_STATE_FOCUS_VISIBLE,
    );
    expect(store.getSnapshot("missing")).toBe(0);
  });

  it("provides selected SSR and pre-registration snapshots without DOM registration", () => {
    const objectValue = {};
    const otherObject = {};
    const store = new ListControlOptionStore<unknown>([
      "selected",
      Number.NaN,
      objectValue,
    ]);

    expect(store.getSnapshot("string", option("string", "selected"))).toBe(
      OPTION_STATE_SELECTED,
    );
    expect(store.getSnapshot("nan", option("nan", Number.NaN))).toBe(
      OPTION_STATE_SELECTED,
    );
    expect(store.getSnapshot("object", option("object", objectValue))).toBe(
      OPTION_STATE_SELECTED,
    );
    expect(
      store.getSnapshot("other-object", option("other-object", otherObject)),
    ).toBe(0);
  });

  it("prefers current render data over passive registration data", () => {
    const store = new ListControlOptionStore<string>(["old"]);
    store.register(option("option", "old"));

    expect(store.getSnapshot("option", option("option", "new"))).toBe(0);
  });

  it("notifies only the previous and next active ids", () => {
    const store = new ListControlOptionStore<string>();
    const notified: string[] = [];
    for (const id of ["one", "two", "three"]) {
      store.register(option(id, id));
      store.subscribe(id, () => notified.push(id));
    }

    store.setActiveId("one");
    notified.length = 0;
    store.setActiveId("two");

    expect(notified).toEqual(["one", "two"]);
    expect(store.getSnapshot("one")).toBe(0);
    expect(store.getSnapshot("two")).toBe(OPTION_STATE_ACTIVE);
  });

  it("notifies only the active id when focus-visible changes", () => {
    const store = new ListControlOptionStore<string>();
    const one = vi.fn();
    const two = vi.fn();
    store.register(option("one", "one"));
    store.register(option("two", "two"));
    store.subscribe("one", one);
    store.subscribe("two", two);
    store.setActiveId("one");
    one.mockClear();

    store.setFocusVisible(true);

    expect(one).toHaveBeenCalledTimes(1);
    expect(two).not.toHaveBeenCalled();
  });

  it("notifies the symmetric difference for controlled selection replacement", () => {
    const store = new ListControlOptionStore<string>(["one", "two"]);
    const notified: string[] = [];
    for (const id of ["one", "two", "three", "four"]) {
      store.register(option(id, id));
      store.subscribe(id, () => notified.push(id));
    }

    store.setSelected(["two", "three"]);

    expect(notified).toEqual(["one", "three"]);
  });

  it("preserves duplicate-value, NaN, and object-reference selection semantics", () => {
    const objectValue = {};
    const equalLookingObject = {};
    const store = new ListControlOptionStore<unknown>();
    const notified: string[] = [];
    for (const [id, value] of [
      ["duplicate-one", "duplicate"],
      ["duplicate-two", "duplicate"],
      ["nan", Number.NaN],
      ["object", objectValue],
      ["other-object", equalLookingObject],
    ] as const) {
      store.register(option(id, value));
      store.subscribe(id, () => notified.push(id));
    }

    store.setSelected(["duplicate", Number.NaN, objectValue]);

    expect(notified).toEqual([
      "duplicate-one",
      "duplicate-two",
      "nan",
      "object",
    ]);
    expect(store.getSnapshot("duplicate-one") & OPTION_STATE_SELECTED).toBe(
      OPTION_STATE_SELECTED,
    );
    expect(store.getSnapshot("duplicate-two") & OPTION_STATE_SELECTED).toBe(
      OPTION_STATE_SELECTED,
    );
    expect(store.getSnapshot("nan") & OPTION_STATE_SELECTED).toBe(
      OPTION_STATE_SELECTED,
    );
    expect(store.getSnapshot("object") & OPTION_STATE_SELECTED).toBe(
      OPTION_STATE_SELECTED,
    );
    expect(store.getSnapshot("other-object") & OPTION_STATE_SELECTED).toBe(0);
  });

  it("notifies an id when its option data is re-registered and ignores stale cleanup", () => {
    const store = new ListControlOptionStore<string>();
    const listener = vi.fn();
    store.subscribe("option", listener);
    const staleCleanup = store.register(option("option", "old"));
    listener.mockClear();
    const cleanup = store.register(option("option", "new", true));
    expect(listener).toHaveBeenCalledTimes(1);
    listener.mockClear();

    staleCleanup();
    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot("option")).toBe(0);

    cleanup();
    expect(listener).not.toHaveBeenCalled();
  });

  it("deletes empty listener sets on unsubscribe", () => {
    const store = new ListControlOptionStore<string>();
    const unsubscribeOne = store.subscribe("one", () => undefined);
    const unsubscribeTwo = store.subscribe("two", () => undefined);
    expect(store.listenerEntryCount).toBe(2);

    unsubscribeOne();
    unsubscribeTwo();

    expect(store.listenerEntryCount).toBe(0);
  });

  it("keeps one-step active notification work constant at 10k", () => {
    const store = new ListControlOptionStore<number>();
    const notified: number[] = [];
    for (let index = 0; index < 10_000; index += 1) {
      const id = String(index);
      store.register(option(id, index));
      store.subscribe(id, () => notified.push(index));
    }
    store.setActiveId("4999");
    notified.length = 0;

    store.setActiveId("5000");

    expect(notified).toEqual([4999, 5000]);
  });

  it("does not notify inactive and unselected Options during initial 10k registration", () => {
    const store = new ListControlOptionStore<number>();
    const listener = vi.fn();
    for (let index = 0; index < 10_000; index += 1) {
      const id = String(index);
      store.subscribe(id, listener);
      store.register(option(id, index));
    }

    expect(listener).not.toHaveBeenCalled();
  });
});
