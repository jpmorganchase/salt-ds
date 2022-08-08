import { RefObject, useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "@jpmorganchase/uitk-core";
import { useResizeObserver, WidthOnly } from "./useResizeObserver";

const NONE: string[] = [];

export function useWidth<Element extends HTMLElement>(
  responsive: boolean
): [RefObject<Element>, number] {
  const [width, setWidth] = useState<number>();
  const ref = useRef<HTMLElement>(null);

  const handleResize = useCallback(({ width: newWidth }) => {
    setWidth(newWidth);
  }, []);

  const measurementsToObserve = responsive ? WidthOnly : NONE;
  useResizeObserver(ref, measurementsToObserve, handleResize);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) {
      return undefined;
    }
    handleResize(ref.current.getBoundingClientRect());
  }, [handleResize, responsive]);

  return [ref, width] as [RefObject<Element>, number];
}
