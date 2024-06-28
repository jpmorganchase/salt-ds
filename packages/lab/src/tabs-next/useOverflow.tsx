import { Children, useMemo, useState } from "react";
import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";

export function useOverflow({ container, selected, children }) {
  const [visible, setVisible] = useState([]);
  const [hidden, setHidden] = useState([]);
  const [count, setCount] = useState(Infinity);
  const targetWindow = useWindow();

  const childArray = useMemo(() => Children.toArray(children), [children]);

  useIsomorphicLayoutEffect(() => {
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const availableWidth = container.offsetWidth;
      const gap = parseInt(
        targetWindow?.getComputedStyle(container)?.gap || "0"
      );

      const elements = container.querySelectorAll("[role=tab]");

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

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [container]);

  useIsomorphicLayoutEffect(() => {
    const nextVisible = childArray.slice(0, count || 1);
    let nextHidden = childArray.slice(count || 1);
    // if (selected && nextHidden.includes(selectedId)) {
    //   const lastVisibleId = nextVisible.pop();
    //   if (lastVisibleId) {
    //     nextHidden = nextHidden.filter((id) => id !== selectedId);
    //     nextHidden.unshift(lastVisibleId);
    //   }
    //   nextVisible.push(selectedId);
    //   move(selectedId);
    // }
    setVisible(nextVisible);
    setHidden(nextHidden);
  }, [childArray, count]);

  return [visible, hidden] as const;
}
