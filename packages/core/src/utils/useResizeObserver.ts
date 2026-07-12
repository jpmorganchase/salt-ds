import { type RefObject, useEffect } from "react";
import { ownerWindow } from "./ownerWindow";

export interface UseResizeObserverProps {
  ref: RefObject<HTMLElement>;
  onResize: () => void;
}

export function useResizeObserver({ ref, onResize }: UseResizeObserverProps) {
  useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const win = ownerWindow(element);
    if (win.closed) return;

    let frameId: number | undefined;

    const resizeObserver = new win.ResizeObserver((entries) => {
      if (entries.length === 0) return;

      if (frameId !== undefined) {
        win.cancelAnimationFrame(frameId);
      }

      frameId = win.requestAnimationFrame(() => {
        frameId = undefined;
        onResize();
      });
    });
    resizeObserver.observe(element);

    return () => {
      if (frameId !== undefined) {
        win.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
    };
  }, [ref, onResize]);
}
