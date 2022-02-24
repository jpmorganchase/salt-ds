import { RefObject, useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "@brandname/core";

import { useResizeObserver, orientationType, WidthOnly } from "../responsive";

type activationIndicatorStyles = {
  height?: number;
  left?: number;
  top?: number;
  width?: number;
};
// Overflow can affect tab positions, so we recalculate when it changes
export function useActivationIndicator(
  rootRef: RefObject<HTMLDivElement | null>,
  tabRef: RefObject<HTMLElement | null>,
  orientation: orientationType
): activationIndicatorStyles {
  const styleRef = useRef<activationIndicatorStyles>({ left: 0, width: 0 });
  const [style, setStyle] = useState<activationIndicatorStyles>({
    left: 0,
    width: 0,
  });

  const [, forceRender] = useState<Record<string, never> | null>(null);
  //   const vertical = orientation === "vertical";
  const createIndicatorStyle = useCallback((): activationIndicatorStyles => {
    if (tabRef.current) {
      const { index, overflowed } = tabRef.current.dataset;
      // We shouldn't need this check, investigate why we get this superfluous render from useOberflowLayout
      if (tabRef.current.dataset?.overflowed === "true") {
        return styleRef.current;
      } else {
        const tabRect = tabRef.current.getBoundingClientRect();
        if (rootRef.current) {
          const rootRect = rootRef.current.getBoundingClientRect();
          if (orientation === "horizontal") {
            const left = tabRect.left - rootRect.left;
            return { left, width: tabRect.width };
          } else {
            const top = tabRect.top - rootRect.top;
            return { top, height: tabRect.height };
          }
        }
      }
    }
    return {};
  }, [orientation, rootRef, tabRef]);

  const onResize = useCallback(() => {
    forceRender({});
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (tabRef.current) {
      const newStyle = createIndicatorStyle();
      let hasChanged = false;
      if (orientation === "horizontal") {
        const { left: newLeft, width: newWidth } = newStyle;
        const { left, width } = styleRef.current;
        hasChanged = left !== newLeft || width !== newWidth;
      } else {
        const { top: newTop, height: newHeight } = newStyle;
        const { top, height } = styleRef.current;
        hasChanged = top !== newTop || height !== newHeight;
      }
      if (hasChanged) {
        setStyle((styleRef.current = newStyle));
      }
    }
  });

  useResizeObserver(tabRef, WidthOnly, onResize);

  return styleRef.current;
}
