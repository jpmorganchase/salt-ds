import { useRef, useCallback } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const ref = useRef(fn);
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback(
    (...args: Args) =>
      // tslint:disable-next-line:ban-comma-operator
      (void 0, ref.current)(...args),
    []
  );
}
