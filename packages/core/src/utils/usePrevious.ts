import { type DependencyList, useEffect, useRef } from "react";

export function usePrevious<T>(
  value: T,
  deps: DependencyList = [],
  initialValue?: T,
): T | undefined {
  const ref = useRef<T | undefined>(initialValue);

  useEffect(() => {
    ref.current = value;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref.current;
}
