import {
  ownerWindow,
  useEventCallback,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import type { RenderedTab } from "../TabsNextContext";
import {
  getGapValue,
  getMeasuredWidth,
  seedWidthMap,
  updateWidthMap,
} from "../widthMeasurement";

interface UseOverflowProps {
  container: RefObject<HTMLElement>;
  selected?: string;
  tabs: RenderedTab[];
  overflowButton: RefObject<HTMLButtonElement>;
  menuOpen: boolean;
}

function getTabWidth(tab: RenderedTab) {
  return tab.width || getMeasuredWidth(tab.root);
}

function getAvailableWidth(element: HTMLElement) {
  const parent = element.parentElement;
  if (!parent) {
    return getMeasuredWidth(element);
  }

  const parentWidth = getMeasuredWidth(parent);
  const parentStyles = ownerWindow(parent).getComputedStyle(parent);
  const parentGap = getGapValue(parentStyles);
  const siblings = Array.from(parent.children).filter(
    (child): child is HTMLElement => {
      if (!(child instanceof HTMLElement) || child === element) {
        return false;
      }

      return ownerWindow(child).getComputedStyle(child).display !== "none";
    },
  );

  const siblingWidth = siblings.reduce((width, sibling) => {
    return width + getMeasuredWidth(sibling);
  }, 0);
  const gapCount = siblings.length > 0 ? siblings.length : 0;
  const availableWidth = Math.max(
    0,
    parentWidth - siblingWidth - gapCount * parentGap,
  );
  return availableWidth;
}

export function useOverflow({
  container,
  overflowButton,
  tabs,
  selected,
  menuOpen,
}: UseOverflowProps) {
  const orderedValues = useMemo(() => tabs.map((tab) => tab.value), [tabs]);
  const orderedValuesKey = orderedValues.join("\0");
  const widthSignature = useMemo(() => {
    return tabs.map((tab) => `${tab.value}:${tab.width.toFixed(2)}`).join("\0");
  }, [tabs]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const pinnedSelectionRef = useRef(selected);
  const previousOrderedValuesKeyRef = useRef(orderedValuesKey);
  const previousWidthSignatureRef = useRef(widthSignature);
  const baseVisibleValues = orderedValues.slice(0, visibleCount);
  const baseHiddenValues = orderedValues.slice(visibleCount);
  const selectedIsHidden = selected
    ? baseHiddenValues.includes(selected)
    : false;
  const pinnedValue = selectedIsHidden ? selected : pinnedSelectionRef.current;

  const measureVisibleCount = useEventCallback((pinnedValue?: string) => {
    const element = container.current;
    if (!element) {
      return tabs.length;
    }

    let maxWidth = getAvailableWidth(element);
    const styles = ownerWindow(element).getComputedStyle(element);
    const gap = getGapValue(styles);

    let currentWidth = 0;
    let nextVisibleCount = 0;
    const visibleItems: RenderedTab[] = [];

    while (nextVisibleCount < tabs.length) {
      const item = tabs[nextVisibleCount];
      if (!item) {
        break;
      }

      const itemWidth = getTabWidth(item) + gap;
      if (currentWidth + itemWidth > maxWidth) {
        break;
      }

      currentWidth += itemWidth;
      visibleItems.push(item);
      nextVisibleCount += 1;
    }

    const overflowWidth = overflowButton.current
      ? overflowButton.current.offsetWidth + gap
      : 0;
    const allTabsFit = nextVisibleCount >= tabs.length;
    if (allTabsFit) {
      return nextVisibleCount;
    }

    maxWidth -= overflowWidth;

    while (currentWidth > maxWidth) {
      const removed = visibleItems.pop();
      if (!removed) {
        break;
      }
      currentWidth -= getTabWidth(removed) + gap;
      nextVisibleCount -= 1;
    }

    const pinnedItem =
      pinnedValue == null
        ? null
        : (tabs.find((item) => item.value === pinnedValue) ?? null);

    if (pinnedItem && !visibleItems.includes(pinnedItem)) {
      const pinnedWidth = getTabWidth(pinnedItem) + gap;
      while (currentWidth + pinnedWidth > maxWidth) {
        const removed = visibleItems.pop();
        if (!removed) {
          break;
        }
        currentWidth -= getTabWidth(removed) + gap;
        nextVisibleCount -= 1;
      }
    }

    return Math.max(0, nextVisibleCount);
  });

  useIsomorphicLayoutEffect(() => {
    if (selected && selectedIsHidden) {
      pinnedSelectionRef.current = selected;
      const nextVisibleCount = measureVisibleCount(selected);
      if (nextVisibleCount !== visibleCount) {
        setVisibleCount(nextVisibleCount);
      }
      if (isMeasuring) {
        setIsMeasuring(false);
      }
    }
  }, [
    isMeasuring,
    measureVisibleCount,
    selected,
    selectedIsHidden,
    visibleCount,
  ]);

  useEffect(() => {
    const element = container.current;
    if (!element || menuOpen || isMeasuring) {
      return;
    }

    const observedElements = [element];
    const parent = element.parentElement;
    if (parent) {
      observedElements.push(parent);
      for (const child of Array.from(parent.children)) {
        if (child instanceof HTMLElement && child !== element) {
          observedElements.push(child);
        }
      }
    }

    const widths = seedWidthMap(observedElements);

    const resizeObserver = new (ownerWindow(element).ResizeObserver)(
      (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          if (!(entry.target instanceof HTMLElement)) {
            continue;
          }

          const nextWidth = entry.contentRect.width;
          if (updateWidthMap(widths, entry.target, nextWidth)) {
            setIsMeasuring(true);
            return;
          }
        }
      },
    );

    for (const observedElement of observedElements) {
      resizeObserver.observe(observedElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [container, isMeasuring, menuOpen]);

  useIsomorphicLayoutEffect(() => {
    if (previousOrderedValuesKeyRef.current !== orderedValuesKey) {
      previousOrderedValuesKeyRef.current = orderedValuesKey;
      setIsMeasuring(true);
    }
  }, [orderedValuesKey]);

  useIsomorphicLayoutEffect(() => {
    if (previousWidthSignatureRef.current !== widthSignature) {
      previousWidthSignatureRef.current = widthSignature;
      setIsMeasuring(true);
    }
  }, [widthSignature]);

  useIsomorphicLayoutEffect(() => {
    if (!isMeasuring || menuOpen) {
      return;
    }

    setVisibleCount(
      measureVisibleCount(
        selectedIsHidden ? selected : pinnedSelectionRef.current,
      ),
    );
    setIsMeasuring(false);
  }, [isMeasuring, measureVisibleCount, menuOpen, selected, selectedIsHidden]);

  let visibleValues = baseVisibleValues;
  let hiddenValues = baseHiddenValues;

  const hiddenPinnedIndex =
    pinnedValue != null ? hiddenValues.indexOf(pinnedValue) : -1;

  if (hiddenPinnedIndex !== -1) {
    const pinnedValue = hiddenValues[hiddenPinnedIndex];
    hiddenValues = hiddenValues.filter(
      (_, index) => index !== hiddenPinnedIndex,
    );
    if (pinnedValue !== undefined) {
      visibleValues = [...visibleValues, pinnedValue];
    }
  }

  return [visibleValues, hiddenValues, isMeasuring] as const;
}
