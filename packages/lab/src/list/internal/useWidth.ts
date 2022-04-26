import { useIsomorphicLayoutEffect } from "@jpmorganchase/uitk-core";
import { RefObject, useCallback, useRef, useState } from "react";

export function useWidth<Element extends HTMLElement>(
  responsive: boolean
): [RefObject<Element>, number] {
  const [width, setWidth] = useState<number>();
  const ref = useRef<Element>();

  const handleResize = useCallback(function handleResize(contentRect: DOMRect) {
    setWidth(contentRect.width);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    handleResize(ref.current.getBoundingClientRect());

    if (responsive) {
      const observer = new ResizeObserver(
        ([{ contentRect }]: ResizeObserverEntry[]) => {
          handleResize(contentRect);
        }
      );
      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [handleResize, responsive]);

  return [ref, width] as [RefObject<Element>, number];
}
