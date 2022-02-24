import {
  MutableRefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface ComponentSize {
  height?: number;
  width: number;
}

export function useComponentSize<T extends HTMLElement>(
  initialWidth: number
): [MutableRefObject<T | null>, ComponentSize] {
  const [size, setSize] = useState<ComponentSize>({ width: initialWidth });
  const ref = useRef<T>(null);

  const handleResize = useCallback(function handleResize({ width, height }) {
    setSize({ width, height });
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) {
      if (process.env.NODE_ENV !== "production") {
        throw new Error(
          "ref returned by useComponentSize was not assigned to a component"
        );
      }
      return;
    }
    handleResize(ref.current.getBoundingClientRect());
    const observer = new ResizeObserver(
      (observerEntries: ResizeObserverEntry[]) => {
        handleResize(observerEntries[0].contentRect);
      }
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [handleResize]);

  return [ref, size];
}
