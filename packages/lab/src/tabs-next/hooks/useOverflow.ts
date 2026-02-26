import {
  ownerWindow,
  useEventCallback,
  useIsomorphicLayoutEffect,
  useValueEffect,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  isValidElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import type { TabNextProps } from "../TabNext";

interface UseOverflowProps {
  container: RefObject<HTMLElement>;
  selected?: string;
  children: ReactNode;
  overflowButton: RefObject<HTMLButtonElement>;
}

function getTabWidth(element: HTMLElement) {
  const { width } = element.getBoundingClientRect();
  return Math.ceil(width);
}

export function useOverflow({
  container,
  overflowButton,
  children,
  selected,
}: UseOverflowProps) {
  /**
   * `visibleCount` doesn't include newly selected tab from overflow menu, which is removed in `computeVisible`
   */
  const [{ visibleCount, isMeasuring }, setVisibleItems] = useValueEffect({
    visibleCount: Number.POSITIVE_INFINITY,
    isMeasuring: false,
  });
  const [pinned, setPinned] = useState(selected);
  const updateOverflowRafRef = useRef<number | null>(null);

  const pinnedValue = pinned ?? selected;

  const targetWindow = useWindow();
  const updateOverflow = useEventCallback(() => {
    const computeVisible = (visibleCount: number) => {
      if (container.current && targetWindow) {
        const widthCache = new Map<HTMLElement, number>();
        const getCachedTabWidth = (element: HTMLElement) => {
          const cached = widthCache.get(element);
          if (cached !== undefined) {
            return cached;
          }

          const width = getTabWidth(element);
          widthCache.set(element, width);
          return width;
        };

        const items = Array.from(
          container.current.querySelectorAll<HTMLElement>(
            "[data-overflowitem]",
          ),
        );

        const pinnedTab = container.current.querySelector<HTMLElement>(
          `[role=tab][data-value="${pinnedValue}"]`,
        )?.parentElement;
        let maxWidth = container.current.clientWidth ?? 0;

        const containerStyles = targetWindow.getComputedStyle(
          container.current,
        );
        const gap = Number.parseInt(containerStyles.gap || "0", 10);

        let currentWidth = 0;
        let newVisibleCount = 0;

        const visible = [];

        while (newVisibleCount < items.length) {
          const element = items[newVisibleCount];
          if (element) {
            const elementWidth = getCachedTabWidth(element) + gap;
            if (currentWidth + elementWidth > maxWidth) {
              break;
            }
            currentWidth += elementWidth;
            visible.push(element);
          }
          newVisibleCount++;
        }

        if (newVisibleCount >= items.length) {
          return { visibleCount: newVisibleCount, items };
        }

        const overflowButtonWidth = overflowButton.current
          ? overflowButton.current.offsetWidth + gap
          : 0;
        maxWidth -= overflowButtonWidth;

        while (currentWidth > maxWidth) {
          const removed = visible.pop();
          if (!removed) break;
          currentWidth -= getCachedTabWidth(removed) + gap;
          newVisibleCount--;
        }

        if (pinnedTab && !visible.includes(pinnedTab)) {
          const selectedTabWidth = getCachedTabWidth(pinnedTab) + gap;
          while (currentWidth + selectedTabWidth > maxWidth) {
            const removed = visible.pop();
            if (!removed) break;
            currentWidth -= getCachedTabWidth(removed) + gap;
            newVisibleCount--;
          }
        }

        // minimal count should be 0, if there is no space for any tab apart from selected tab from the overflow menu
        return { visibleCount: Math.max(0, newVisibleCount), items };
      }
      return { visibleCount, items: [] };
    };

    setVisibleItems(function* () {
      // Show all
      yield {
        visibleCount: Number.POSITIVE_INFINITY,
        isMeasuring: true,
      };

      // Measure the visible count
      const { visibleCount: newVisibleCount, items } = computeVisible(
        Number.POSITIVE_INFINITY,
      );
      const isMeasuring = newVisibleCount < items.length && newVisibleCount > 0;
      yield {
        visibleCount: newVisibleCount,
        isMeasuring,
      };

      // ensure the visible count is correct
      if (isMeasuring) {
        yield {
          visibleCount: computeVisible(newVisibleCount).visibleCount,
          isMeasuring: false,
        };
      }
    });
  });
  const scheduleOverflowUpdate = useEventCallback(() => {
    if (updateOverflowRafRef.current != null) {
      return;
    }

    if (typeof requestAnimationFrame !== "function") {
      updateOverflow();
      return;
    }

    updateOverflowRafRef.current = requestAnimationFrame(() => {
      updateOverflowRafRef.current = null;
      updateOverflow();
    });
  });

  useEffect(() => {
    return () => {
      if (updateOverflowRafRef.current != null) {
        cancelAnimationFrame(updateOverflowRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const element = container?.current;
    if (!element) return;

    const win = ownerWindow(element);
    const parentElement = element.parentElement;

    const resizeObserver = new win.ResizeObserver((entries) => {
      if (entries.length === 0) return;
      scheduleOverflowUpdate();
    });
    resizeObserver.observe(element);
    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [container, scheduleOverflowUpdate]);

  useEffect(() => {
    const element = container?.current;
    if (!element || isMeasuring) return;

    const win = ownerWindow(element);

    const mutationObserver = new win.MutationObserver(() => {
      scheduleOverflowUpdate();
    });

    mutationObserver.observe(element, {
      childList: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [container, scheduleOverflowUpdate, isMeasuring]);

  const childArray = Children.toArray(children);
  let visible = childArray.slice(0, visibleCount);
  let hidden = childArray.slice(visibleCount);

  const isSelectedHidden = hidden.some(
    (child) =>
      isValidElement<TabNextProps>(child) && child.props?.value === selected,
  );

  useIsomorphicLayoutEffect(() => {
    if (!isMeasuring && isSelectedHidden && selected !== pinned) {
      setPinned(selected);
    }
  }, [isMeasuring, isSelectedHidden, pinned, selected]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to recompute when selected or pinned changes.
  useIsomorphicLayoutEffect(() => {
    updateOverflow();
  }, [pinned, selected, updateOverflow]);

  const hiddenPinnedIndex = hidden.findIndex(
    (child) =>
      isValidElement<TabNextProps>(child) && child.props?.value === pinned,
  );

  if (hiddenPinnedIndex !== -1) {
    const pinnedChild = hidden[hiddenPinnedIndex];
    hidden = hidden.filter((_, index) => index !== hiddenPinnedIndex);
    if (pinnedChild !== undefined) {
      visible = [...visible, pinnedChild];
    }
  }

  if (isMeasuring) {
    return [childArray, [], isMeasuring] as const;
  }

  return [visible, hidden, isMeasuring] as const;
}
