import { useCallback, useEffect, useRef, useState } from "react";

export interface Item {
  id: string;
  element?: HTMLElement | null;
  value: string;
  location?: "hidden" | "main" | "overflow";
  order?: number;
  stale?: boolean;
}

interface StaleItem extends Item {
  staleIndex?: number;
}

function sortBasedOnDOMPosition(items: Item[]): Item[] {
  const indexedItems = items.map((item, index) => [index, item] as const);
  let orderChanged = false;
  indexedItems.sort(([itemAIndex, itemA], [itemBIndex, itemB]) => {
    if (
      itemA.order != null &&
      itemA.order >= 0 &&
      itemB.order != null &&
      itemB.order >= 0 &&
      itemA.order !== itemB.order
    ) {
      if (
        (itemA.order < itemB.order && itemAIndex > itemBIndex) ||
        (itemA.order > itemB.order && itemAIndex < itemBIndex)
      ) {
        orderChanged = true;
      }
      return itemA.order - itemB.order;
    }

    const itemAElement = itemA.element;
    const itemBElement = itemB.element;
    if (itemAElement === itemBElement) return 0;
    if (!itemAElement || !itemBElement) return 0;

    const pos = itemAElement.compareDocumentPosition(itemBElement);
    if (pos & Node.DOCUMENT_POSITION_DISCONNECTED) return 0;

    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
      if (itemAIndex > itemBIndex) {
        orderChanged = true;
      }
      return -1;
    }

    if (itemAIndex < itemBIndex) {
      orderChanged = true;
    }
    return 1;
  });

  if (orderChanged) {
    return indexedItems.map(([_, item]) => item);
  }
  return items;
}

interface UseCollectionProps {
  targetWindow: Window | null | undefined;
  wrap: boolean;
}

export function useCollection({ wrap, targetWindow }: UseCollectionProps) {
  const itemsRef = useRef<Item[]>([]);
  const itemMap = useRef<Map<string, Item>>(new Map());
  const removedItems = useRef<Map<string, StaleItem>>(new Map());
  const [removalVersion, setRemovalVersion] = useState(0);

  const getOrderedItems = useCallback(() => {
    return sortBasedOnDOMPosition(Array.from(itemMap.current.values()));
  }, []);

  const getNavigableItems = useCallback(() => {
    return getOrderedItems().filter((item) => {
      if (item.location === "hidden") {
        return false;
      }

      return !!item.element;
    });
  }, [getOrderedItems]);

  const sortItems = useCallback(() => {
    itemsRef.current = getOrderedItems();
  }, [getOrderedItems]);

  const getRemovedItems = useCallback(() => {
    const items = new Map(removedItems.current);
    removedItems.current.clear();

    return items;
  }, []);

  const rafId = useRef<number | null>(null);

  const scheduleSort = useCallback(() => {
    if (!targetWindow?.requestAnimationFrame) {
      sortItems();
      return;
    }

    if (rafId.current != null) {
      targetWindow.cancelAnimationFrame(rafId.current);
    }

    rafId.current = targetWindow.requestAnimationFrame(() => {
      rafId.current = null;
      sortItems();
    });
  }, [sortItems, targetWindow]);

  const registerItem = useCallback(
    (item: Item) => {
      itemMap.current.set(item.id, item);
      removedItems.current.delete(item.id);
      scheduleSort();

      return () => {
        const currentItems = getOrderedItems();
        const currentItem = itemMap.current.get(item.id) ?? item;
        const staleIndex = currentItems.findIndex(({ id }) => id === item.id);

        removedItems.current.set(item.id, {
          ...currentItem,
          staleIndex,
        });

        itemsRef.current = currentItems.filter(({ id }) => id !== item.id);
        itemMap.current.delete(item.id);
        setRemovalVersion((currentVersion) => currentVersion + 1);
      };
    },
    [getOrderedItems, scheduleSort],
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<Item, "id" | "value">>) => {
      const currentItem = itemMap.current.get(id);
      if (!currentItem) {
        return;
      }

      let changed = false;
      const nextItem = { ...currentItem };

      for (const [key, nextValue] of Object.entries(updates)) {
        const typedKey = key as keyof Omit<Item, "id" | "value">;
        if (nextItem[typedKey] !== nextValue) {
          changed = true;
          nextItem[typedKey] = nextValue as never;
        }
      }

      if (!changed) {
        return;
      }

      itemMap.current.set(id, nextItem);
      itemsRef.current = itemsRef.current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return nextItem;
      });
      scheduleSort();
    },
    [scheduleSort],
  );

  useEffect(() => {
    return () => {
      if (rafId.current != null && targetWindow) {
        targetWindow.cancelAnimationFrame(rafId.current);
      }
    };
  }, [targetWindow]);

  return {
    registerItem,
    item: useCallback((id?: string | null): Item | null => {
      if (!id) return null;
      let item = itemMap.current.get(id);
      if (!item) {
        item = itemsRef.current.find((item) => item.id === id);
        if (item) {
          itemMap.current.set(item.id, item);
        }
      }
      return item ?? null;
    }, []),
    getNext: useCallback(
      (current: string): Item | null => {
        const items = getNavigableItems();
        if (items.length === 0) return null;

        const index = items.findIndex(({ id }) => id === current);

        if (index === -1) {
          return wrap ? items[0] : null;
        }

        const newIndex = wrap
          ? (index + 1) % items.length
          : Math.min(index + 1, items.length - 1);

        return items[newIndex] ?? null;
      },
      [getNavigableItems, wrap],
    ),
    getPrevious: useCallback(
      (current: string): Item | null => {
        const items = getNavigableItems();
        if (items.length === 0) return null;

        const index = items.findIndex(({ id }) => id === current);

        if (index === -1) {
          return wrap ? items[items.length - 1] : null;
        }

        const newIndex = wrap
          ? (index - 1 + items.length) % items.length
          : Math.max(index - 1, 0);

        return items[newIndex] ?? null;
      },
      [getNavigableItems, wrap],
    ),
    getFirst: useCallback((): Item | null => {
      return getNavigableItems()[0] ?? null;
    }, [getNavigableItems]),
    getLast: useCallback((): Item | null => {
      const items = getNavigableItems();
      return items[items.length - 1] ?? null;
    }, [getNavigableItems]),
    getIndex: useCallback(
      (current: string): number => {
        return getNavigableItems().findIndex(({ id }) => id === current);
      },
      [getNavigableItems],
    ),
    itemAt: useCallback(
      (index: number): Item | null => {
        return getNavigableItems()[index] ?? null;
      },
      [getNavigableItems],
    ),
    updateItem,
    getRemovedItems,
    removalVersion,
    sortItems,
  };
}
