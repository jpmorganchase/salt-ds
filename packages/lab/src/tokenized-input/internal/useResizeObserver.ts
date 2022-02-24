// TODO: Use resize observer from Tabstrip / Toolbar

import { useRef, useEffect, useLayoutEffect, Ref } from "react";

/**
 * This monitors the size of a component and calls `onSizeChange` callback
 * every time when size changes.
 */
export function useResizeObserver<Element extends HTMLElement>(
  onSizeChange: (
    entries: ResizeObserverEntry[],
    observer?: ResizeObserver
  ) => void
): Ref<Element> {
  const ref = useRef<Element>(null);

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    const observer = new ResizeObserver(onSizeChange);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [onSizeChange]);

  useLayoutEffect(() => {
    if (ref.current) {
      onSizeChange([
        {
          target: ref.current,
          contentRect: ref.current.getBoundingClientRect(),
          borderBoxSize: [],
          contentBoxSize: [],
        },
      ]);
    }
  }, [onSizeChange]);

  return ref;
}
