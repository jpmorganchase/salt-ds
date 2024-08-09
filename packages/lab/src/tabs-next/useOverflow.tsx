import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  type ReactNode,
  type RefObject,
  useMemo,
  useState,
} from "react";

export function useOverflow({
  container,
  selected,
  children,
}: {
  container: RefObject<HTMLElement>;
  selected?: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState<any[]>([]);
  const [hidden, setHidden] = useState<any[]>([]);
  const [count, setCount] = useState(Number.POSITIVE_INFINITY);
  const targetWindow = useWindow();

  const childArray = useMemo(() => Children.toArray(children), [children]);

  useIsomorphicLayoutEffect(() => {
    if (!container.current) return;

    const observer = new ResizeObserver(() => {
      if (!container.current) return;

      const availableWidth = container.current.clientWidth;
      const gap = Number.parseInt(
        targetWindow?.getComputedStyle(container.current)?.gap || "0",
      );

      const elements =
        container.current.querySelectorAll<HTMLElement>("[role=tab]");

      let i = 0;
      let currentWidth = 0;
      while (i < elements.length) {
        const element = elements[i];
        if (element) {
          currentWidth += element.offsetWidth + gap;
          if (currentWidth > availableWidth) {
            break;
          }
        }
        i++;
      }
      setCount(Math.max(1, i));
    });

    observer.observe(container.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const nextVisible = childArray.slice(0, count || 1);
    const nextHidden = childArray.slice(count || 1);

    const hiddenSelectedIndex = nextHidden.findIndex(
      (child) => child?.props?.value === selected,
    );

    if (selected && hiddenSelectedIndex !== -1) {
      const lastVisibleId = nextVisible.pop();
      if (lastVisibleId) {
        const removed = nextHidden.splice(hiddenSelectedIndex, 1);
        nextHidden.unshift(lastVisibleId);
        nextVisible.push(removed[0]);
      }
    }
    setVisible(nextVisible);
    setHidden(nextHidden);
  }, [childArray, count, selected]);

  return [visible, hidden] as const;
}
