import {
  debounce,
  ownerWindow,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import {
  type DependencyList,
  type Ref,
  useCallback,
  useRef,
  useState,
} from "react";

export function useOverflowDetection<Element extends HTMLElement>(
  dependencies: DependencyList = [],
): [Ref<Element>, boolean] {
  const targetRef = useRef<Element>(null);
  const [isOverflowed, setOverflowed] = useState(false);

  const handleResize = useCallback(
    debounce(() => {
      const { current } = targetRef;

      if (!current) {
        // no component to measure yet
        isOverflowed && setOverflowed(false);
        return;
      }

      setOverflowed(current.offsetWidth < current.scrollWidth);
    }),
    [isOverflowed],
  );

  // check on resizing
  useIsomorphicLayoutEffect(() => {
    // Multi window support
    const win = ownerWindow(targetRef.current);

    win.addEventListener("resize", handleResize);
    return () => {
      handleResize.clear();
      win.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // We don't put handleResize in the dependency array as it's been handled by the `useLayoutEffect` above
  useIsomorphicLayoutEffect(handleResize, dependencies);

  return [targetRef, isOverflowed];
}
