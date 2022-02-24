import { DependencyList, EffectCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@brandname/core";
export const useLayoutEffectOnce = (
  condition: boolean,
  callback: EffectCallback,
  dependencies: DependencyList
): void => {
  const hasRun = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (condition && !hasRun.current) {
      hasRun.current = true;
      callback();
    }
  }, dependencies);
};
