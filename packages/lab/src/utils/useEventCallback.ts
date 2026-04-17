import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useCallback, useRef } from "react";

/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
export function useEventCallback<const T extends (...args: any[]) => void>(
  fn: T,
): T {
  const ref = useRef<T>(fn);

  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback(
    ((...args: any[]) => {
      const latestFn = ref.current;
      return latestFn(...args);
    }) as T,
    [],
  );
}
