import { useWindow } from "@salt-ds/window";
import { useCallback, useRef } from "react";
import {
  useIsomorphicLayoutEffect,
  useResizeObserver,
  useValueEffect,
} from "../utils";

export function useTruncatePills({
  pills,
  enable,
}: {
  pills: string[];
  enable?: boolean;
}) {
  const pillListRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleItems] = useValueEffect(pills.length);
  const targetWindow = useWindow();

  const updateOverflow = useCallback(() => {
    if (!enable) {
      return;
    }

    const computeVisible = (visibleCount: number) => {
      const pillList = pillListRef.current;

      if (pillList && targetWindow) {
        const pillElements = Array.from(
          pillList.querySelectorAll('[role="listitem"]'),
        );
        const maxWidth = pillList.getBoundingClientRect().width;
        const listGap = Number.parseInt(
          targetWindow.getComputedStyle(pillList).gap,
          10,
        );
        const isShowingOverflow = pillList.querySelector(
          "[data-overflowindicator]",
        );

        let currentSize = 0;
        let newVisibleCount = 0;

        if (isShowingOverflow) {
          const pill = pillElements.pop();
          if (pill) {
            const pillWidth = pill.getBoundingClientRect().width;
            currentSize += pillWidth + listGap;
          }
        }

        for (const pill of pillElements) {
          const pillWidth = pill.getBoundingClientRect().width;
          currentSize += pillWidth + listGap;

          if (Math.round(currentSize) <= Math.round(maxWidth)) {
            newVisibleCount++;
          } else {
            break;
          }
        }
        return newVisibleCount;
      }
      return visibleCount;
    };

    setVisibleItems(function* () {
      // Show all
      yield pills.length;

      // Measure the visible count
      const newVisibleCount = computeVisible(pills.length);
      const isMeasuring = newVisibleCount < pills.length && newVisibleCount > 0;
      yield newVisibleCount;

      // ensure the visible count is correct
      if (isMeasuring) {
        yield computeVisible(newVisibleCount);
      }
    });
  }, [pills, setVisibleItems, enable, targetWindow]);

  useIsomorphicLayoutEffect(() => {
    updateOverflow();
  }, [updateOverflow]);

  useResizeObserver({
    ref: pillListRef,
    onResize: updateOverflow,
  });

  return {
    pillListRef,
    visibleCount,
    visiblePills: enable ? pills.slice(0, visibleCount) : pills,
  };
}
