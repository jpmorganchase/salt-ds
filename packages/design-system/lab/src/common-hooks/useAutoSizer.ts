import {
  RefObject,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  Ref,
} from "react";

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

export function useAutoSizer<Element extends HTMLElement>(
  props: ListAutosizerProps
): size {
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

  useLayoutEffect(() => {
    setSize({ width, height });
  }, [width, height]);

  useLayoutEffect(() => {
    if (responsive) {
      let observer: ResizeObserver;
      if (ref.current) {
        handleResize(ref.current.getBoundingClientRect());
        observer = new ResizeObserver(
          ([{ contentRect }]: ResizeObserverEntry[]) => {
            // TODO (currently firing because of scrollbar)
            // handleResize(contentRect);
          }
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

  return size;
}
