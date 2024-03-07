import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useValueEffect } from "../utils/useValueEffect";
import { useWindow } from "@salt-ds/window";
import { useResizeObserver } from "../responsive";

export function useTruncatePills({
  pills,
  enable,
}: {
  pills: string[];
  enable?: boolean;
}) {
  const pillListRef = useRef<HTMLDivElement>(null);
  const [{ visibleCount }, setVisibleItems] = useValueEffect({
    visibleCount: pills.length,
  });
  const targetWindow = useWindow();

  const updateOverflow = useCallback(() => {
    if (!enable) {
      return;
    }

    const computeVisible = (visibleCount: number) => {
      const pillList = pillListRef.current;

      if (pillList && targetWindow) {
        let pillElements = Array.from(
          pillList.querySelectorAll('[role="listitem"]')
        ) as HTMLLIElement[];
        const maxWidth = pillList.getBoundingClientRect().width;
        const listGap = parseInt(targetWindow.getComputedStyle(pillList).gap);
        let isShowingOverflow = pillList.querySelector(
          "[data-overflowindicator]"
        );

        let currentSize = 0;
        let newVisibleCount = 0;

        if (isShowingOverflow) {
          let pill = pillElements.pop();
          if (pill) {
            let pillWidth = pill.getBoundingClientRect().width;
            currentSize += pillWidth + listGap;
          }
        }

        for (let pill of pillElements) {
          let pillWidth = pill.getBoundingClientRect().width;
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
      yield {
        visibleCount: pills.length,
      };

      // Measure the visible count
      let newVisibleCount = computeVisible(pills.length);
      let isMeasuring = newVisibleCount < pills.length && newVisibleCount > 0;
      yield {
        visibleCount: newVisibleCount,
      };

      // ensure the visible count is correct
      if (isMeasuring) {
        newVisibleCount = computeVisible(visibleCount);
        yield {
          visibleCount: newVisibleCount,
        };
      }
    });
  }, [pills, setVisibleItems, enable, targetWindow]);

  useIsomorphicLayoutEffect(updateOverflow, [updateOverflow, pills]);
  useResizeObserver(pillListRef, ["width"], updateOverflow, true);

  return {
    pillListRef,
    visibleCount,
    visiblePills: enable ? pills.slice(0, visibleCount) : pills,
  };
}
