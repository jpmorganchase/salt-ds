import { useCallback, useEffect, useRef } from "react";

export interface Item {
  id: string;
  element?: HTMLElement | null;
  value: string;
  stale?: boolean;
}

interface StaleItem extends Item {
  staleIndex?: number;
}

function sortBasedOnDOMPosition(items: Item[]): Item[] {
  const indexedItems = items.map((item, index) => [index, item] as const);
  let orderChanged = false;
  indexedItems.sort(([itemAIndex, itemA], [itemBIndex, itemB]) => {
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
  wrap: boolean;
}

export function useCollection({ wrap }: UseCollectionProps) {
  const itemsRef = useRef<Item[]>([]);
  const itemMap = useRef<Map<string, Item>>(new Map());
  const removedItems = useRef<Map<string, StaleItem>>(new Map());

  const sortItems = useCallback(() => {
    const newItems = Array.from(itemMap.current.values());
    itemsRef.current = sortBasedOnDOMPosition(newItems);
  }, []);

  const getRemovedItems = useCallback(() => {
    const items = new Map(removedItems.current);
    removedItems.current.clear();

    return items;
  }, []);

  const rafId = useRef<number | null>(null);

  const scheduleSort = useCallback(() => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      sortItems();
    });
  }, [sortItems]);

  const registerItem = useCallback(
    (item: Item) => {
      itemMap.current.set(item.id, item);
      removedItems.current.delete(item.id);
      scheduleSort();

      return () => {
        removedItems.current.set(item.id, {
          ...item,
          staleIndex: itemsRef.current.findIndex(({ id }) => id === item.id),
        });

        itemsRef.current = itemsRef.current.filter(({ id }) => id !== item.id);
        itemMap.current.delete(item.id);
      };
    },
    [scheduleSort],
  );

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

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
        const items = itemsRef.current;
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
      [wrap],
    ),
    getPrevious: useCallback(
      (current: string): Item | null => {
        const items = itemsRef.current;
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
      [wrap],
    ),
    getFirst: useCallback((): Item | null => {
      return itemsRef.current[0] ?? null;
    }, []),
    getLast: useCallback((): Item | null => {
      return itemsRef.current[itemsRef.current.length - 1] ?? null;
    }, []),
    getIndex: useCallback((current: string): number => {
      return itemsRef.current.findIndex(({ id }) => id === current);
    }, []),
    itemAt: useCallback((index: number): Item | null => {
      return itemsRef.current[index] ?? null;
    }, []),
    getRemovedItems,
    sortItems,
  };
}
