import { useEffect, useState } from "react";
import { type Item, TableOfContents } from "./TableOfContents";

const headingSelector =
  '[data-mdx="heading2"], [data-mdx="heading3"], [data-mdx="heading4"]';

export function RuntimeTableOfContents() {
  const items = useRuntimeTableOfContents();
  const itemKey = items.map((item) => item.id).join(":");

  return <TableOfContents key={itemKey} items={items} />;
}

function useRuntimeTableOfContents() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const root = document.querySelector("main");

    if (!root) {
      return undefined;
    }

    let rafId: number | null = null;

    const refresh = () => {
      const nextItems = getRuntimeItems(root);
      setItems((currentItems) =>
        areItemsEqual(currentItems, nextItems) ? currentItems : nextItems,
      );
    };

    const schedule = () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        refresh();
      });
    };

    refresh();

    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      attributeFilter: ["data-mdx", "id"],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return items;
}

function getRuntimeItems(root: Element) {
  return Array.from(root.querySelectorAll<HTMLElement>(headingSelector))
    .map((heading) => {
      const id = heading.id;
      const text = heading.textContent?.trim();

      if (!id || !text) {
        return null;
      }

      return {
        id,
        level: getHeadingLevel(heading),
        text,
      };
    })
    .filter((item): item is Item => item !== null);
}

function getHeadingLevel(heading: HTMLElement) {
  const headingLevel = heading.dataset.mdx?.match(/^heading([2-4])$/)?.[1];

  return headingLevel ? Number(headingLevel) - 1 : 1;
}

function areItemsEqual(currentItems: Item[], nextItems: Item[]) {
  return (
    currentItems.length === nextItems.length &&
    currentItems.every((item, index) => {
      const nextItem = nextItems[index];
      return (
        nextItem !== undefined &&
        item.id === nextItem.id &&
        item.level === nextItem.level &&
        item.text === nextItem.text
      );
    })
  );
}
