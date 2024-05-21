import {
  useIsomorphicLayoutEffect,
  useResizeObserver,
  useValueEffect,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  type ReactNode,
  type RefObject,
  useCallback,
  useMemo,
} from "react";
import type { Item } from "./useCollection";

interface UseOverflowProps {
  container: RefObject<HTMLElement>;
  selected?: string;
  children: ReactNode;
  tabs: Item[];
  overflowButton: RefObject<HTMLButtonElement>;
}

function getAvailableWidth({
  container,
  targetWindow,
}: {
  container: UseOverflowProps["container"];
  targetWindow: Window;
}) {
  if (!container.current || !targetWindow) return 0;

  const containerStyles = targetWindow.getComputedStyle(container.current);

  const containerPadding =
    Number.parseInt(containerStyles.paddingLeft || "0") +
    Number.parseInt(containerStyles.paddingRight || "0");

  return container.current.clientWidth - containerPadding;
}

export function useOverflow({
  tabs,
  container,
  overflowButton,
  children,
  selected,
}: UseOverflowProps) {
  const [{ visibleCount, isMeasuring }, setVisibleItems] = useValueEffect({
    visibleCount: tabs.length,
    isMeasuring: false,
  });
  const targetWindow = useWindow();

  const updateOverflow = useCallback(() => {
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

        let maxWidth = getAvailableWidth({
          container,
          targetWindow,
        });

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
            if (currentWidth + element.offsetWidth + gap > maxWidth) {
              break;
            }
            currentWidth += element.offsetWidth + gap;
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
          currentWidth -= removed.offsetWidth + gap;
          newVisibleCount--;
        }

        if (selectedTab && !visible.includes(selectedTab)) {
          while (currentWidth + selectedTab.offsetWidth + gap > maxWidth) {
            const removed = visible.pop();
            if (!removed) break;
            currentWidth -= removed.offsetWidth + gap;
            newVisibleCount--;
          }
        }

        return Math.max(1, newVisibleCount);
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
  }, [setVisibleItems, targetWindow, container, overflowButton, tabs.length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to update when selected changes.
  useIsomorphicLayoutEffect(() => {
    updateOverflow();
  }, [updateOverflow, selected]);

  useResizeObserver({
    ref: container,
    onResize: updateOverflow,
  });

  const childArray = useMemo(() => Children.toArray(children), [children]);
  const visible = childArray.slice(0, visibleCount || 1);
  const hidden = childArray.slice(visibleCount || 1);

  const hiddenSelectedIndex = hidden.findIndex(
    // @ts-ignore
    (child) => child?.props?.value === selected,
  );

  if (selected && hiddenSelectedIndex !== -1) {
    const removed = hidden.splice(hiddenSelectedIndex, 1);
    visible.push(removed[0]);
  }

  if (isMeasuring) {
    return [childArray, [], isMeasuring] as const;
  }

  return [visible, hidden, isMeasuring] as const;
}
