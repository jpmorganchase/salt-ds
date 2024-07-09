import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type DependencyList, type EffectCallback, useRef } from "react";
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
