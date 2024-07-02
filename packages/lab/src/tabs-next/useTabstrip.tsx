import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useControlled, useIsomorphicLayoutEffect } from "@salt-ds/core";

interface Item {
  id: string;
  element?: HTMLElement | null;
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

function useCollection({ root }: { root: HTMLElement }) {
  const [items, setItems] = useState<Item[]>([]);
  const itemMap = useRef<Map<string, Item>>(new Map());

  const registerItem = (item: Item) => {
    setItems((old) => {
      const index = items.findIndex(({ id }) => id === item.id);
      const newItems = old.slice();
      if (index !== -1) {
        const newItem = { ...items[index], ...item };
        newItems[index] = newItem;
        itemMap.current.set(item.id, newItem);
      } else {
        newItems.push(item);
        itemMap.current.set(item.id, item);
      }
      return sortBasedOnDOMPosition(newItems);
    });

    return () => {
      setItems((old) => {
        itemMap.current.delete(item.id);
        return old.filter(({ id }) => id !== item.id);
      });
    };
  };

  return {
    registerItem,
    item: (id?: string | null) => {
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
    getNext: (current: string) => {
      const index = items.findIndex(({ id }) => id === current);
      return items[Math.min(index + 1, items.length - 1)]?.id;
    },
    getPrevious: (current: string) => {
      const index = items.findIndex(({ id }) => id === current);
      return items[Math.max(index - 1, 0)]?.id;
    },
    getFirst: (current: string) => {
      return items[0]?.id;
    },
    getLast: (current: string) => {
      return items[items.length - 1]?.id;
    },
    items,
  };
}

export function useTabstrip({
  container,
  selected: selectedProp,
  defaultSelected,
}) {
  const { registerItem, item, getNext, getPrevious, getFirst, getLast } =
    useCollection({
      root: container,
    });
  const [selected, setSelectedState] = useControlled({
    controlled: selectedProp,
    default: defaultSelected,
    name: "TabstripNext",
    state: "selected",
  });
  const [active, setActive] = useState<string | null>(selected);
  const movedRef = useRef(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!active) return;
    const actionMap = {
      ArrowRight: getNext,
      ArrowLeft: getPrevious,
      Home: getFirst,
      End: getLast,
    };

    const action = actionMap[event.key as keyof typeof actionMap];

    if (action) {
      event.preventDefault();
      const nextId = action(active);
      if (nextId) {
        movedRef.current = true;
        setActive(nextId);
      }
    }
  };

  const setSelected = useCallback((action) => {
    setSelectedState(action);
    setActive(action);
  }, []);

  useEffect(() => {
    if (!movedRef.current) return;
    const itemElement = item(active)?.element;
    if (itemElement) {
      itemElement.focus({ preventScroll: true });
      itemElement.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [active]);

  return {
    registerItem,
    setSelected,
    setActive,
    selected,
    active,
    handleKeyDown,
  };
}
