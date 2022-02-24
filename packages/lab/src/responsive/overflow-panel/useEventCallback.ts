import * as React from "react";
import { useIsomorphicLayoutEffect } from "@brandname/core";

/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 *
 * @param {function} fn
 */
export default function useEventCallback(fn: Function) {
  const ref = React.useRef(fn);
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore we need the comma operator/sequence here
  return React.useCallback((...args) => (0, ref.current)(...args), []);
}
