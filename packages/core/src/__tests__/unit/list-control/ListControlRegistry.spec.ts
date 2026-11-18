import { describe, expect, it } from "vitest";
import type { OptionValue } from "../../../list-control/ListControlContext";
import {
  createCoalescedRebuild,
  ListControlRegistry,
} from "../../../list-control/ListControlRegistry";

const option = <Item>(id: string, value: Item): OptionValue<Item> => ({
  id,
  value,
  disabled: false,
});

const element = (id: string, connected = true) =>
  ({ id, isConnected: connected }) as HTMLElement;

const list = (elements: HTMLElement[]) =>
  ({ querySelectorAll: () => elements }) as unknown as HTMLElement;

describe("ListControlRegistry", () => {
  it("registers unique ids and replaces a same-id registration", () => {
    const registry = new ListControlRegistry<string>();
    registry.register(option("a", "first"), element("a"));
    const replacement = element("a");
    registry.register(option("a", "replacement"), replacement);

    expect(registry.length).toBe(1);
    expect(registry.getAt(0)).toMatchObject({
      data: { value: "replacement" },
      element: replacement,
    });
  });

  it("does not let stale cleanup remove a newer same-id entry", () => {
    const registry = new ListControlRegistry<string>();
    const staleCleanup = registry.register(option("a", "first"), element("a"));
    registry.register(option("a", "replacement"), element("a"));

    staleCleanup();

    expect(registry.getAt(0)?.data.value).toBe("replacement");
  });

  it("cleans up a bulk registration and repeated mount/unmount", () => {
    const registry = new ListControlRegistry<number>();
    const cleanups = Array.from({ length: 1_000 }, (_, index) =>
      registry.register(option(String(index), index), element(String(index))),
    );
    cleanups.forEach((cleanup) => {
      cleanup();
    });
    registry.rebuild(list([]));

    expect(registry.length).toBe(0);
    for (let index = 0; index < 100; index++) {
      const cleanup = registry.register(
        option("repeat", index),
        element("repeat"),
      );
      cleanup();
    }
    registry.rebuild(list([]));
    expect(registry.length).toBe(0);
  });

  it("rebuilds in DOM order including options nested in groups", () => {
    const registry = new ListControlRegistry<string>();
    const a = element("a");
    const b = element("b");
    const c = element("c");
    registry.register(option("a", "A"), a);
    registry.register(option("b", "B"), b);
    registry.register(option("c", "C"), c);

    // querySelectorAll returns descendant options in document order, including groups.
    registry.rebuild(list([c, a, b]));

    expect([0, 1, 2].map((index) => registry.getAt(index)?.data.value)).toEqual(
      ["C", "A", "B"],
    );
    expect(registry.indexOfId("a")).toBe(1);
  });

  it("uses ids for active neighbors while value lookup keeps first-duplicate semantics", () => {
    const registry = new ListControlRegistry<string>();
    registry.register(option("first", "duplicate"), element("first"));
    registry.register(option("second", "duplicate"), element("second"));
    registry.register(option("third", "next"), element("third"));

    const activeIndex = registry.indexOfId("second");

    expect(registry.getAt(activeIndex - 1)?.data.id).toBe("first");
    expect(registry.getAt(activeIndex + 1)?.data.id).toBe("third");
    expect(registry.indexOfValue("duplicate")).toBe(0);
  });

  it("does not expose removed or disconnected nodes", () => {
    const registry = new ListControlRegistry<string>();
    const connected = element("connected");
    const disconnected = element("disconnected", false);
    registry.register(option("connected", "connected"), connected);
    registry.register(option("disconnected", "disconnected"), disconnected);

    registry.rebuild(list([connected, disconnected]));

    expect(registry.snapshot().map((entry) => entry.data.value)).toEqual([
      "connected",
    ]);
  });

  it("keeps a compact logical snapshot while a removal rebuild is pending", () => {
    const registry = new ListControlRegistry<string>();
    const cleanupA = registry.register(option("a", "A"), element("a"));
    registry.register(option("b", "B"), element("b"));
    registry.register(option("c", "C"), element("c"));

    cleanupA();

    expect(registry.length).toBe(2);
    expect(registry.getAt(0)?.data.value).toBe("B");
    expect(registry.getAt(1)?.data.value).toBe("C");
    expect(registry.indexOfId("c")).toBe(1);
    expect(registry.indexOfValue("C")).toBe(1);
  });

  it("rebuilds 10k options with one DOM-order walk", () => {
    const registry = new ListControlRegistry<number>();
    let yielded = 0;
    const elements = Array.from({ length: 10_000 }, (_, index) => {
      const current = element(String(index));
      registry.register(option(String(index), index), current);
      return current;
    });
    const measuredList = {
      querySelectorAll: () => ({
        [Symbol.iterator]: function* () {
          for (const current of elements) {
            yielded++;
            yield current;
          }
        },
      }),
    } as unknown as HTMLElement;

    registry.rebuild(measuredList);

    expect(yielded).toBe(10_000);
    expect(registry.length).toBe(10_000);
  });
});

describe("createCoalescedRebuild", () => {
  it("coalesces a mutation batch to one rebuild", () => {
    const queued: (() => void)[] = [];
    let rebuilds = 0;
    const controller = createCoalescedRebuild(
      () => rebuilds++,
      (callback) => queued.push(callback),
    );

    controller.schedule();
    controller.schedule();
    controller.schedule();

    expect(queued).toHaveLength(1);
    queued[0]();
    expect(rebuilds).toBe(1);
  });

  it("cancels a pending rebuild during cleanup", () => {
    const queued: (() => void)[] = [];
    let rebuilds = 0;
    const controller = createCoalescedRebuild(
      () => rebuilds++,
      (callback) => queued.push(callback),
    );

    controller.schedule();
    controller.cancel();
    queued[0]();

    expect(rebuilds).toBe(0);
  });
});
