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
  useRef,
} from "react";
import type { TabNextProps } from "../TabNext";
import type { Item } from "./useCollection";

interface UseOverflowProps {
  container: RefObject<HTMLElement>;
  selected?: string;
  children: ReactNode;
  tabs: Item[];
  overflowButton: RefObject<HTMLButtonElement>;
}

function getTabWidth(element: HTMLElement) {
  const { width } = element.getBoundingClientRect();
  return Math.ceil(width);
}

export function useOverflow({
  tabs,
  container,
  overflowButton,
  children,
  selected,
}: UseOverflowProps) {
  /**
   * `visibleCount` doesn't include newly selected tab from overflow menu, which is removed in `computeVisible`
   */
  const [{ visibleCount, isMeasuring }, setVisibleItems] = useValueEffect({
    visibleCount: tabs.length,
    isMeasuring: false,
  });
  const targetWindow = useWindow();
  const realSelectedIndex = useRef<number>(-1);

  const updateOverflow = useEventCallback(() => {
    const computeVisible = (visibleCount: number) => {
      if (container.current && targetWindow) {
        const items = Array.from(
          container.current.querySelectorAll<HTMLElement>(
            "[data-overflowitem]",
          ),
        );
        const selectedTab = container.current.querySelector<HTMLElement>(
          "[role=tab][aria-selected=true]",
        )?.parentElement;

        let maxWidth = container.current.clientWidth ?? 0;

        const containerStyles = targetWindow.getComputedStyle(
          container.current,
        );
        const gap = Number.parseInt(containerStyles.gap || "0");

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
          return newVisibleCount;
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

        if (selectedTab && !visible.includes(selectedTab)) {
          const selectedTabWidth = getTabWidth(selectedTab) + gap;
          while (currentWidth + selectedTabWidth > maxWidth) {
            const removed = visible.pop();
            if (!removed) break;
            currentWidth -= getTabWidth(selectedTab) + gap;
            newVisibleCount--;
          }
        }

        // minimal count should be 0, if there is no space for any tab apart from selected tab from the overflow menu
        return Math.max(0, newVisibleCount);
      }
      return visibleCount;
    };

    setVisibleItems(function* () {
      // Show all
      yield {
        visibleCount: tabs.length,
        isMeasuring: true,
      };

      // Measure the visible count
      const newVisibleCount = computeVisible(tabs.length);
      const isMeasuring = newVisibleCount < tabs.length && newVisibleCount > 0;
      yield {
        visibleCount: newVisibleCount,
        isMeasuring,
      };

      // ensure the visible count is correct
      if (isMeasuring) {
        yield {
          visibleCount: computeVisible(newVisibleCount),
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
      requestAnimationFrame(() => {
        if (entries.length === 0) return;

        updateOverflow();
      });
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
      requestAnimationFrame(() => {
        updateOverflow();
      });
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

  const hiddenSelectedIndex = hidden.findIndex(
    (child) =>
      isValidElement<TabNextProps>(child) && child?.props?.value === selected,
  );

  useIsomorphicLayoutEffect(() => {
    if (visibleCount === childArray.length) {
      realSelectedIndex.current = childArray.findIndex(
        (child) =>
          isValidElement<TabNextProps>(child) &&
          child?.props?.value === selected,
      );
    }
  }, [visibleCount, childArray, selected]);

  if (selected && hiddenSelectedIndex !== -1) {
    const removed = hidden.splice(hiddenSelectedIndex, 1);
    visible.push(removed[0]);
  }

  if (isMeasuring) {
    return [childArray, [], isMeasuring, realSelectedIndex] as const;
  }

  return [visible, hidden, isMeasuring, realSelectedIndex] as const;
}
