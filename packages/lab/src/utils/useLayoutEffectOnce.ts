import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type DependencyList, type EffectCallback, useRef } from "react";
export const useLayoutEffectOnce = (
  condition: boolean,
  callback: EffectCallback,
  dependencies: DependencyList,
): void => {
  const hasRun = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (condition && !hasRun.current) {
      hasRun.current = true;
      callback();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, dependencies);
};
