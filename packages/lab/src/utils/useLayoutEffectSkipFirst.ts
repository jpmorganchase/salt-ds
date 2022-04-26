import { DependencyList, EffectCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@brandname/core";

export const useLayoutEffectSkipFirst = (
  callback: EffectCallback,
  dependencies: DependencyList
): void => {
  const goodToGo = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (goodToGo.current) {
      callback();
    } else {
      goodToGo.current = true;
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, dependencies);
};
