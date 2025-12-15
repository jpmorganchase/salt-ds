import { useCallback, useRef } from "react";

export interface Item {
  id: string;
  element?: HTMLElement | null;
  value: string;
  stale?: boolean;
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

    if (
      itemAElement.compareDocumentPosition(itemBElement) &
      Node.DOCUMENT_POSITION_FOLLOWING
    ) {
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

  const batchTimeout = useRef<number | null>(null);

  const registerItem = useCallback((item: Item) => {
    itemMap.current.set(item.id, item);

    if (batchTimeout.current) {
      window.clearTimeout(batchTimeout.current);
    }

    batchTimeout.current = window.setTimeout(() => {
      for (const [id, item] of itemMap.current) {
        if (item.stale) {
          itemMap.current.delete(id);
        }
      }
    }, 44);

    return () => {
      itemMap.current.set(item.id, {
        ...item,
        stale: true,
        staleIndex: itemsRef.current.findIndex(({ id }) => id === item.id),
      });
      itemsRef.current = itemsRef.current.filter(({ id }) => id !== item.id);
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
        const index = itemsRef.current.findIndex(({ id }) => id === current);

        const newIndex = wrap
          ? (index + 1) % itemsRef.current.length
          : Math.min(index + 1, itemsRef.current.length - 1);

        return itemsRef.current[newIndex] ?? null;
      },
      [wrap],
    ),
    getPrevious: useCallback(
      (current: string): Item | null => {
        const index = itemsRef.current.findIndex(({ id }) => id === current);

        const newIndex = wrap
          ? (index - 1 + itemsRef.current.length) % itemsRef.current.length
          : Math.max(index - 1, 0);

        return itemsRef.current[newIndex] ?? null;
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
    sortItems: useCallback(() => {
      const newItems = Array.from(
        itemMap.current.values().filter((item) => !item.stale),
      );
      itemsRef.current = sortBasedOnDOMPosition(newItems);
    }, []),
  };
}
