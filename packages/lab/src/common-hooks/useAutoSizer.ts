import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type RefObject, useCallback, useState } from "react";

export interface ListAutosizerProps {
  containerRef: RefObject<Element>;
  responsive: boolean;
  height?: number | string;
  width?: number | string;
}

interface size {
  height?: number | string;
  width?: number | string;
}

export function useAutoSizer(props: ListAutosizerProps): size {
  const { containerRef: ref, responsive, width, height } = props;
  const [size, setSize] = useState({ width, height });

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
      // let observer: ResizeObserver;
      if (ref.current) {
        handleResize(ref.current.getBoundingClientRect());
        // observer = new ResizeObserver(
        //   ([{ contentRect }]: ResizeObserverEntry[]) => {
        //     // TODO (currently firing because of scrollbar)
        //     // handleResize(contentRect);
        //   },
        // );
        // observer.observe(ref.current);
      }
      return () => {
        // if (observer) {
        //   observer.disconnect();
        // }
      };
    }
  }, [handleResize, responsive, ref]);

  return size;
}
