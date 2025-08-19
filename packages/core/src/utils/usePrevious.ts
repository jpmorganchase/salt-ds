import { type DependencyList, useEffect, useRef } from "react";

export function usePrevious<T>(
  value: T,
  deps: DependencyList = [],
  initialValue?: T,
): T | undefined {
  const ref = useRef<T | undefined>(initialValue);

  useEffect(() => {
    ref.current = value;
    // biome-ignore lint/correctness/useExhaustiveDependencies: usePrevious is takes a dependency list to control when it updates, so we don't need to include value in the deps array.
  }, deps);
  return ref.current;
}
