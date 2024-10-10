import { useCallback, useRef, useState } from "react";

export interface Item {
  id: string;
  element?: HTMLElement | null;
  value: string;
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
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const itemMap = useRef<Map<string, Item>>(new Map());

  const registerItem = useCallback((item: Item) => {
    setItems((old) => {
      const newItems = old.slice();
      const index = newItems.findIndex(({ id }) => id === item.id);
      if (index !== -1) {
        const newItem = { ...newItems[index], ...item };
        newItems[index] = newItem;
        itemMap.current.set(item.id, newItem);
      } else {
        newItems.push(item);
        itemMap.current.set(item.id, item);
      }
      const value = sortBasedOnDOMPosition(newItems);
      itemsRef.current = value;
      return value;
    });

    return () => {
      setItems((old) => {
        itemMap.current.delete(item.id);
        return old.filter(({ id }) => id !== item.id);
      });
      return itemsRef;
    };
  }, []);

  return {
    registerItem,
    item: (id?: string | null): Item | null => {
      if (!id) return null;
      let item = itemMap.current.get(id);
      if (!item) {
        item = items.find((item) => item.id === id);
        if (item) {
          itemMap.current.set(item.id, item);
        }
      }
      return item ?? null;
    },
    getNext: (current: string): Item | null => {
      const index = items.findIndex(({ id }) => id === current);

      const newIndex = wrap
        ? (index + 1) % items.length
        : Math.min(index + 1, items.length - 1);

      return items[newIndex] ?? null;
    },
    getPrevious: (current: string): Item | null => {
      const index = items.findIndex(({ id }) => id === current);

      const newIndex = wrap
        ? (index - 1 + items.length) % items.length
        : Math.max(index - 1, 0);

      return items[newIndex] ?? null;
    },
    getFirst: (): Item | null => {
      return items[0] ?? null;
    },
    getLast: (): Item | null => {
      return items[items.length - 1] ?? null;
    },
    items,
  };
}
