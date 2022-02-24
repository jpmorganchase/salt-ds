import { createRef, RefObject, useCallback, useRef } from "react";

/**
 * return an array of ref objects, recreate if count changes.
 */
export function useChildRefs<T extends HTMLElement = HTMLDivElement>(
  childCount: number
): [RefObject<RefObject<T>[]>, (index: number) => T | null] {
  const childRefs = useRef<RefObject<T>[]>([]);

  if (childRefs.current.length !== childCount) {
    // add or remove refs
    childRefs.current = Array(childCount)
      .fill(null)
      .map((_, i) => childRefs.current[i] || createRef<T>());
  }

  const getChildRef = useCallback(
    (index: number) => {
      if (childRefs.current[index]) {
        return childRefs.current[index].current;
      } else {
        return null;
      }
    },
    [childRefs]
  );

  return [childRefs, getChildRef];
}
