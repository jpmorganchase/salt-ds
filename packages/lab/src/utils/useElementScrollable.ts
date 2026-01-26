import { useWindow } from "@salt-ds/window";
import {
  type MutableRefObject,
  type RefObject,
  useEffect,
  useState,
} from "react";

export interface ElementScrollable {
  x: boolean;
  y: boolean;
  isScrollable: boolean;
}

type ElementScrollableRef<T extends HTMLElement> =
  | MutableRefObject<T | null>
  | RefObject<T>
  | null;

type WindowWithResizeObserver = Window & {
  ResizeObserver: typeof ResizeObserver;
};

export interface UseElementScrollableOptions {
  targetWindow?: Window | null;
}

export function useElementScrollable<T extends HTMLElement>(
  ref: ElementScrollableRef<T>,
  options?: UseElementScrollableOptions,
): ElementScrollable {
  const [scrollable, setScrollable] = useState({ x: false, y: false });
  const contextWindow = useWindow();
  const targetWindow = options?.targetWindow ?? contextWindow;

  useEffect(() => {
    const element = ref?.current ?? null;
    if (!element) return;

    const checkScrollable = () => {
      const x = element.scrollWidth > element.clientWidth;
      const y = element.scrollHeight > element.clientHeight;

      setScrollable((prev) => {
        if (prev.x !== x || prev.y !== y) {
          return { x, y };
        }
        return prev;
      });
    };

    // Initial check
    checkScrollable();

    // Set up ResizeObserver to monitor size changes
    const ResizeObserverCtor =
      (targetWindow as WindowWithResizeObserver | null)?.ResizeObserver ??
      (typeof ResizeObserver !== "undefined" ? ResizeObserver : undefined);

    if (!ResizeObserverCtor) {
      return;
    }

    const resizeObserver = new ResizeObserverCtor(checkScrollable);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, targetWindow]);

  return {
    x: scrollable.x,
    y: scrollable.y,
    isScrollable: scrollable.x || scrollable.y,
  };
}
