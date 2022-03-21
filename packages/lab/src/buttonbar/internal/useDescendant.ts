// Copied from https://gist.github.com/ryanflorence/10e9387f633f9d2e6f444a9bddaabf6e
import { useContext, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@brandname/core";

import { DescendantContext } from "./DescendantContext";

export function useDescendant(descendant: Record<string, any>): number {
  const { assigning, setItems } = useContext(DescendantContext);
  const index = useRef(-1);

  useIsomorphicLayoutEffect(() => {
    if (assigning?.current && setItems) {
      setItems((old) => {
        index.current = old.length;
        return old.concat(descendant);
      });
    }
  });

  // first render its wrong, after a forceUpdate in parent useIsomorphicLayoutEffect it's
  // right, and its all synchronous so we don't get any flashing
  return index.current;
}
