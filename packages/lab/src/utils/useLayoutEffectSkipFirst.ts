import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { type DependencyList, type EffectCallback, useRef } from "react";

export const useLayoutEffectSkipFirst = (
  callback: EffectCallback,
  dependencies: DependencyList,
): void => {
  const goodToGo = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: dependencies are forwarded to the hook
  useIsomorphicLayoutEffect(() => {
    if (goodToGo.current) {
      callback();
    } else {
      goodToGo.current = true;
    }
  }, dependencies);
};
