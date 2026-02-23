import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useCallback, useRef } from "react";

/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
export function useEventCallback<const T extends (...args: any[]) => void>(
  fn: T,
): T {
  /**
   * For both React 18 and 19 we set the ref to the forbiddenInRender function, to catch illegal calls to the function during render.
   * Once the insertion effect runs, we set the ref to the actual function.
   */
  const ref = useRef(fn as T);

  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback(
    ((...args: any[]) => {
      const latestFn = ref.current!;
      return latestFn(...args);
    }) as T,
    [],
  );
}
