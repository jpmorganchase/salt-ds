import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type CSSProperties, useCallback, useRef, useState } from "react";

export interface ListAutosizerProps {
  responsive: boolean;
  height?: number | string;
  width?: number | string;
}

export function useListAutoSizer<Element extends HTMLElement>(
  props: ListAutosizerProps,
) {
  const { responsive, width, height } = props;
  const [size, setSize] = useState<CSSProperties>({ width, height });
  const ref = useRef<Element>(null);

  const handleResize = useCallback(function handleResize(contentRect: DOMRect) {
    if (contentRect.width > 0 && contentRect.height > 0) {
      setSize({
        width: contentRect.width,
        height: contentRect.height,
      });
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    setSize({ width, height });
  }, [width, height]);

  useIsomorphicLayoutEffect(() => {
    if (responsive) {
      let observer: ResizeObserver;
      if (ref.current) {
        handleResize(ref.current.getBoundingClientRect());
        observer = new ResizeObserver(
          ([{ contentRect }]: ResizeObserverEntry[]) => {
            handleResize(contentRect);
          },
        );
        observer.observe(ref.current);
      }
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [handleResize, responsive]);

  return [ref, size] as const;
}
