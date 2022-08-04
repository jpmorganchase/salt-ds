import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useResizeObserver, orientationType, WidthOnly } from "../responsive";

type activationIndicatorStyles = {
  height?: number;
  left?: number;
  top?: number;
  width?: number;
  hasChanged?: boolean;
};

const MEASUREMENTS = {
  horizontal: {
    pos: "left" as keyof activationIndicatorStyles,
    size: "width" as keyof activationIndicatorStyles,
  },
  vertical: {
    pos: "top" as keyof activationIndicatorStyles,
    size: "height" as keyof activationIndicatorStyles,
  },
};

// Overflow can affect tab positions, so we recalculate when it changes
export function useActivationIndicator({
  rootRef,
  tabId,
  orientation,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  tabId?: string;
  orientation: orientationType;
}): activationIndicatorStyles {
  const [style, setStyle] = useState<activationIndicatorStyles>({
    left: 0,
    width: 0,
  });
  // Keep style in a ref, so style is not a dependency for createIndicatorStyle, which in turn
  // means our useEffect below will re-run only when the tab changes, not after every style change
  // as well.

  const styleRef = useRef(style);

  const getTabPos = useCallback(() => {
    const { pos, size } = MEASUREMENTS[orientation];
    return [pos, size];
  }, [orientation]);

  const createIndicatorStyle = useCallback(
    (tabElement: HTMLElement | null): activationIndicatorStyles => {
      if (tabElement) {
        const tabRect = tabElement.getBoundingClientRect() as any;
        if (rootRef.current && tabRect) {
          const rootRect = rootRef.current.getBoundingClientRect() as any;
          const [pos, size] = getTabPos();
          const { [pos]: existingPos, [size]: existingSize } = styleRef.current;
          const newPos = tabRect[pos] - rootRect[pos];
          const newSize = tabRect[size];

          return {
            [pos]: newPos,
            [size]: newSize,
            hasChanged: newPos !== existingPos || newSize !== existingSize,
          };
        }
      }
      return {};
    },
    [orientation, rootRef]
  );

  const onResize = useCallback(() => {
    requestAnimationFrame(() => {
      if (tabId) {
        const tabEl = document.getElementById(tabId);
        const { hasChanged, ...newStyle } = createIndicatorStyle(tabEl);
        if (hasChanged) {
          setStyle(newStyle);
        }
      }
    });
  }, [createIndicatorStyle, tabId]);

  useEffect(() => {
    if (tabId) {
      // The timeout is employed in case selectedTab has been selected from
      // overflow menu. In this case, the tab is only restored to visibility
      // in the render cycle after selection.
      setTimeout(() => {
        const tabEl = document.getElementById(tabId);
        const { hasChanged, ...newStyle } = createIndicatorStyle(tabEl);
        if (hasChanged) {
          setStyle((styleRef.current = newStyle));
        }
      }, 50);
    }
  }, [createIndicatorStyle, tabId]);

  useResizeObserver(rootRef, WidthOnly, onResize);

  return style;
}
