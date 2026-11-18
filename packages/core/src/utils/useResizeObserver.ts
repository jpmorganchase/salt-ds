import { type RefObject, useEffect } from "react";
import { ownerWindow } from "./ownerWindow";

export interface UseResizeObserverProps {
  /**
   * The ref of the element to observe.
   */
  ref: RefObject<HTMLElement | null>;
  /**
   * Callback fired when the element is resized.
   */
  onResize: () => void;
}

export function useResizeObserver({ ref, onResize }: UseResizeObserverProps) {
  useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const win = ownerWindow(element);

    const resizeObserver = new win.ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (entries.length === 0) return;

        onResize();
      });
    });
    resizeObserver.observe(element);

    return () => {
      if (element) {
        resizeObserver.unobserve(element);
      }
    };
  }, [ref, onResize]);
}
