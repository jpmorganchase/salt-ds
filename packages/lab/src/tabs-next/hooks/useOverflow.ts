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
  useMemo,
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

  const pinnedValue = pinned ?? selected;

  const targetWindow = useWindow();
  const updateOverflow = useEventCallback(() => {
    const computeVisible = (visibleCount: number) => {
      if (container.current && targetWindow) {
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
            if (currentWidth + getTabWidth(element) + gap > maxWidth) {
              break;
            }
            currentWidth += getTabWidth(element) + gap;
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
          currentWidth -= getTabWidth(removed) + gap;
          newVisibleCount--;
        }

        if (pinnedTab && !visible.includes(pinnedTab)) {
          const selectedTabWidth = getTabWidth(pinnedTab) + gap;
          while (currentWidth + selectedTabWidth > maxWidth) {
            const removed = visible.pop();
            if (!removed) break;
            currentWidth -= getTabWidth(removed) + gap;
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to update when selected changes.
  useIsomorphicLayoutEffect(() => {
    updateOverflow();
  }, [selected]);

  useEffect(() => {
    const handleWindowResize = () => {
      updateOverflow();
    };

    targetWindow?.addEventListener("resize", handleWindowResize);

    return () => {
      targetWindow?.removeEventListener("resize", handleWindowResize);
    };
  }, [updateOverflow, targetWindow]);

  useEffect(() => {
    const element = container?.current;
    if (!element) return;

    const win = ownerWindow(element);

    const resizeObserver = new win.ResizeObserver((entries) => {
      if (entries.length === 0) return;
      requestAnimationFrame(updateOverflow);
    });
    resizeObserver.observe(element);
    if (element.parentElement) {
      resizeObserver.observe(element.parentElement);
    }

    return () => {
      if (element) {
        resizeObserver.unobserve(element);
      }
    };
  }, [container, updateOverflow]);

  useEffect(() => {
    const element = container?.current;
    if (!element || isMeasuring) return;

    const win = ownerWindow(element);

    const mutationObserver = new win.MutationObserver(() => {
      requestAnimationFrame(updateOverflow);
    });

    mutationObserver.observe(element, {
      childList: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [container, updateOverflow, isMeasuring]);

  const childArray = useMemo(() => Children.toArray(children), [children]);
  const visible = useMemo(
    () => childArray.slice(0, visibleCount),
    [visibleCount, childArray],
  );
  const hidden = useMemo(
    () => childArray.slice(visibleCount),
    [childArray, visibleCount],
  );

  const hiddenSelected = hidden.find(
    (child) =>
      isValidElement<TabNextProps>(child) && child?.props?.value === selected,
  );

  if (hiddenSelected) {
    setPinned(selected);
  }

  const hiddenPinnedIndex = hidden.findIndex(
    (child) =>
      isValidElement<TabNextProps>(child) && child?.props?.value === pinned,
  );

  if (hiddenPinnedIndex !== -1) {
    const removed = hidden.splice(hiddenPinnedIndex, 1);
    visible.push(removed[0]);
  }

  if (isMeasuring) {
    return [childArray, [], isMeasuring] as const;
  }

  return [visible, hidden, isMeasuring] as const;
}
