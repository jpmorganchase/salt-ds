import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type MutableRefObject, useCallback, useRef, useState } from "react";
import {
  type ResizeHandler,
  useResizeObserver,
  WidthOnly,
} from "./useResizeObserver";

const NONE: string[] = [];

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export function useWidth<Element extends HTMLElement>(
  responsive: boolean,
): [MutableRefObject<Element | null>, number] {
  const [width, setWidth] = useState<number>();
  const ref = useRef<Element | null>(null);

  const handleResize: ResizeHandler = useCallback(({ width: newWidth }) => {
    setWidth(newWidth);
  }, []);

  const measurementsToObserve = responsive ? WidthOnly : NONE;
  useResizeObserver(ref, measurementsToObserve, handleResize);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) {
      return undefined;
    }
    handleResize(ref.current.getBoundingClientRect());
  }, [handleResize]);

  return [ref, width] as [MutableRefObject<Element | null>, number];
}
