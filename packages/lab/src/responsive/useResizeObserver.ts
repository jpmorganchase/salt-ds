/* eslint-disable no-restricted-syntax */
import { useIsomorphicLayoutEffect } from "@jpmorganchase/uitk-core";
import { useCallback, useRef, RefObject } from "react";
export const WidthHeight = ["height", "width"];
export const WidthOnly = ["width"];

type measurements = { [key: string]: number };
type observedDetails = {
  onResize?: (measurements: measurements) => void;
  measurements: measurements;
};
const observedMap = new WeakMap<HTMLElement, observedDetails>();

const isScrollAttribute: { [key: string]: boolean } = {
  scrollHeight: true,
  scrollWidth: true,
};

// TODO should we make this create-on-demand
const resizeObserver = new ResizeObserver((entries: any[]) => {
  for (const entry of entries) {
    const { target, contentRect } = entry;
    const observedTarget = observedMap.get(target);
    if (observedTarget) {
      const { onResize, measurements } = observedTarget;
      let sizeChanged = false;
      for (const [dimension, size] of Object.entries(measurements)) {
        const newSize = isScrollAttribute[dimension]
          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            target[dimension]
          : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            contentRect[dimension];
        if (newSize !== size) {
          sizeChanged = true;
          // console.log(
          //   `${dimension} changed from ${measurements[dimension]} to ${newSize}`
          // );
          measurements[dimension] = newSize;
        }
      }
      if (sizeChanged) {
        // TODO only return measured sizes
        // const { height, width } = contentRect;
        onResize && onResize(measurements);
      }
    }
  }
});

// TODO use an optional lag (default to false) to ask to fire onResize
// with initial size
export function useResizeObserver(
  ref: RefObject<Element | HTMLElement | null>,
  dimensions: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onResize: (sizes: any) => void
) {
  const dimensionsRef = useRef(dimensions);

  const measure = useCallback((target): measurements => {
    const rect = target.getBoundingClientRect();
    return dimensionsRef.current.reduce(
      (map: { [key: string]: number }, dim) => {
        if (isScrollAttribute[dim]) {
          map[dim] = target[dim];
        } else {
          map[dim] = rect[dim];
        }
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
      observedMap.set(target, { measurements: {} });
      cleanedUp = false;
      const { fonts } = document as any;
      if (fonts) {
        await fonts.ready;
      }
      if (!cleanedUp) {
        const observedTarget = observedMap.get(target);
        if (observedTarget) {
          const measurements = measure(target);
          observedTarget.measurements = measurements;
          resizeObserver.observe(target);
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
      // TODO set a pending entry on map
      registerObserver();
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
