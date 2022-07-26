/* eslint-disable no-restricted-syntax */
import { useIsomorphicLayoutEffect } from "@jpmorganchase/uitk-core";
import { useCallback, useRef, RefObject } from "react";
export const WidthHeight = ["height", "width"];
export const HeightOnly = ["height"];
export const WidthOnly = ["width"];

export type measurements<T = string | number> = {
  height?: T;
  scrollHeight?: T;
  scrollWidth?: T;
  width?: T;
};
type measuredDimension = keyof measurements<number>;

export type ResizeHandler = (measurements: measurements<number>) => void;

type observedDetails = {
  onResize?: ResizeHandler;
  measurements: measurements<number>;
};
const observedMap = new WeakMap<HTMLElement, observedDetails>();

const getTargetSize = (
  element: HTMLElement,
  contentRect: DOMRectReadOnly,
  dimension: measuredDimension
): number => {
  switch (dimension) {
    case "height":
      return contentRect.height;
    case "scrollHeight":
      return element.scrollHeight;
    case "scrollWidth":
      return element.scrollWidth;
    case "width":
      return contentRect.width;
    default:
      return 0;
  }
};

const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
  for (const entry of entries) {
    const { target, contentRect } = entry;
    const observedTarget = observedMap.get(target as HTMLElement);
    if (observedTarget) {
      const { onResize, measurements } = observedTarget;
      let sizeChanged = false;
      for (const [dimension, size] of Object.entries(measurements)) {
        const newSize = getTargetSize(
          target as HTMLElement,
          contentRect,
          dimension as measuredDimension
        );
        if (newSize !== size) {
          sizeChanged = true;
          measurements[dimension as measuredDimension] = newSize;
        }
      }
      if (sizeChanged) {
        onResize && onResize(measurements);
      }
    }
  }
});

// TODO use an optional lag (default to false) to ask to fire onResize
// with initial size
// Note asking for scrollHeight alone will not trigger onResize, this is only triggered by height,
// with scrollHeight returned as an auxilliary value
export function useResizeObserver(
  ref: RefObject<Element | HTMLElement | null>,
  dimensions: string[],
  onResize: ResizeHandler,
  reportInitialSize = false
): void {
  const dimensionsRef = useRef(dimensions);
  const measure = useCallback((target: HTMLElement): measurements<number> => {
    const rect = target.getBoundingClientRect();
    return dimensionsRef.current.reduce(
      (map: { [key: string]: number }, dim) => {
        map[dim] = getTargetSize(target, rect, dim as measuredDimension);
        return map;
      },
      {}
    );
  }, []);

  // TODO use ref to store resizeHandler here
  // resize handler registered with REsizeObserver will never change
  // use ref to store user onResize callback here
  // resizeHandler will call user callback.current

  // Keep this effect separate in case user inadvertently passes different
  // dimensions or callback instance each time - we only ever want to
  // initiate new observation when ref changes.
  useIsomorphicLayoutEffect(() => {
    const target = ref.current as HTMLElement;
    let cleanedUp = false;

    async function registerObserver() {
      // Create the map entry immediately. useEffect may fire below
      // before fonts are ready and attempt to update entry
      observedMap.set(target, { measurements: {} as measurements<number> });
      cleanedUp = false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { fonts } = document as any;
      if (fonts) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await fonts.ready;
      }
      if (!cleanedUp) {
        const observedTarget = observedMap.get(target);
        if (observedTarget) {
          const measurements = measure(target);
          observedTarget.measurements = measurements;
          resizeObserver.observe(target);
          if (reportInitialSize) {
            onResize(measurements);
          }
        }
      }
    }

    if (target) {
      // TODO might we want multiple callers to attach a listener to the same element ?
      if (observedMap.has(target)) {
        throw Error(
          "useResizeObserver attemping to observe same element twice"
        );
      }
      void registerObserver();
    }
    return () => {
      if (target && observedMap.has(target)) {
        resizeObserver.unobserve(target);
        observedMap.delete(target);
        cleanedUp = true;
      }
    };
  }, [ref, measure]);

  useIsomorphicLayoutEffect(() => {
    const target = ref.current as HTMLElement;
    const record = observedMap.get(target);
    if (record) {
      if (dimensionsRef.current !== dimensions) {
        dimensionsRef.current = dimensions;
        const measurements = measure(target);
        record.measurements = measurements;
      }
      // Might not have changed, but no harm ...
      record.onResize = onResize;
    }
  }, [dimensions, measure, ref, onResize]);

  // TODO might be a good idea to ref and return the current measurememnts. That way, derived hooks
  // e.g useBreakpoints don't have to measure and client cn make onResize callback simpler
}
