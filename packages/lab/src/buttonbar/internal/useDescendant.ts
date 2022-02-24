// Copied from https://gist.github.com/ryanflorence/10e9387f633f9d2e6f444a9bddaabf6e
import { useContext, useLayoutEffect, useRef } from "react";

import { DescendantContext } from "./DescendantContext";

export function useDescendant(descendant: Record<string, any>): number {
  const { assigning, setItems } = useContext(DescendantContext);
  const index = useRef(-1);

  useLayoutEffect(() => {
    if (assigning?.current && setItems) {
      setItems((old) => {
        index.current = old.length;
        return old.concat(descendant);
      });
    }
  });

  // first render its wrong, after a forceUpdate in parent useLayoutEffect it's
  // right, and its all synchronous so we don't get any flashing
  return index.current;
}
