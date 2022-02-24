import {
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  Ref,
  DependencyList,
} from "react";
import { debounce } from "@brandname/core";
import { ownerWindow } from "./ownerWindow";

export function useOverflowDetection<Element extends HTMLElement>(
  dependencies: DependencyList = []
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
    [targetRef, isOverflowed]
  );

  // check on resizing
  useLayoutEffect(() => {
    // Multi window support
    const win = ownerWindow(targetRef.current);

    win.addEventListener("resize", handleResize);
    return () => {
      handleResize.clear();
      win.removeEventListener("resize", handleResize);
    };
  }, [targetRef, handleResize]);

  // We don't put handleResize in the dependency array as it's been handled by the `useLayoutEffect` above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(handleResize, dependencies);

  return [targetRef, isOverflowed];
}
