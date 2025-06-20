import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
): (...args: Args) => Return {
  const ref = useRef(fn);
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  // biome-ignore lint/complexity/noCommaOperator: This is a valid use case for the comma operator
  return useCallback((...args: Args) => (void 0, ref.current)(...args), []);
}
