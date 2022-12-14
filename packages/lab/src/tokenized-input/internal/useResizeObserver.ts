// TODO: Use resize observer from Tabstrip / Toolbar

import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useRef, useEffect, Ref } from "react";

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

  useIsomorphicLayoutEffect(() => {
    if (ref.current) {
      onSizeChange([
        {
          target: ref.current,
          contentRect: ref.current.getBoundingClientRect(),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ]);
    }
  }, [onSizeChange]);

  return ref;
}
