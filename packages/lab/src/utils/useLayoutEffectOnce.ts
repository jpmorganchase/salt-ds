import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type DependencyList, type EffectCallback, useRef } from "react";
/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useLayoutEffectOnce = (
  condition: boolean,
  callback: EffectCallback,
  dependencies: DependencyList,
): void => {
  const hasRun = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: dependencies are forwarded to the hook
  useIsomorphicLayoutEffect(() => {
    if (condition && !hasRun.current) {
      hasRun.current = true;
      callback();
    }
  }, dependencies);
};
