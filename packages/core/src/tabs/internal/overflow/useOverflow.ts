import {
  type MutableRefObject,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ownerWindow, useIsomorphicLayoutEffect } from "../../../utils";
import type { RenderedTab } from "../contexts/TabsContext";
import { isHTMLElement } from "../utils/domUtils";
import {
  calculateVisibleCount,
  MIN_TRUSTED_TAB_WIDTH,
  partitionVisibleValues,
} from "./overflowMath";
import {
  getGapValue,
  getMeasuredWidth,
  seedWidthMap,
  updateWidthMap,
} from "./widthMeasurement";

interface UseOverflowProps {
  container: RefObject<HTMLElement>;
  selected?: string;
  tabs: RenderedTab[];
  overflowButton: RefObject<HTMLButtonElement>;
  menuOpen: boolean;
}

function getTabWidth(tab: RenderedTab) {
  const width = tab.width || getMeasuredWidth(tab.root);
  return width > MIN_TRUSTED_TAB_WIDTH ? width : null;
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
      if (!isHTMLElement(child) || child === element) {
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

function isSelectedValueHidden(
  selected: string | undefined,
  hiddenValues: string[],
) {
  return selected !== undefined && hiddenValues.includes(selected);
}

function getPinnedSelectionValue(
  selected: string | undefined,
  selectedIsHidden: boolean,
  pinnedSelectionRef: MutableRefObject<string | undefined>,
) {
  return selectedIsHidden ? selected : pinnedSelectionRef.current;
}

export function useOverflow({
  container,
  overflowButton,
  tabs,
  selected,
  menuOpen,
}: UseOverflowProps) {
  const orderedValues = useMemo(() => tabs.map((tab) => tab.value), [tabs]);
  const measurementInputKey = useMemo(() => {
    return tabs.map((tab) => `${tab.value}:${tab.width.toFixed(2)}`).join("\0");
  }, [tabs]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [measureRetryVersion, setMeasureRetryVersion] = useState(0);
  const pinnedSelectionRef = useRef(selected);
  const previousOverflowButtonWidthRef = useRef(0);
  const previousMeasurementInputKeyRef = useRef(measurementInputKey);
  const previousMenuOpenRef = useRef(menuOpen);
  const measureRetryFrameRef = useRef<number | null>(null);
  const measureRetryCountRef = useRef(0);
  const baseHiddenValues = orderedValues.slice(visibleCount);
  const selectedIsHidden = isSelectedValueHidden(selected, baseHiddenValues);
  const pinnedValue = getPinnedSelectionValue(
    selected,
    selectedIsHidden,
    pinnedSelectionRef,
  );
  const getCurrentPinnedValue = useCallback(() => {
    return getPinnedSelectionValue(
      selected,
      selectedIsHidden,
      pinnedSelectionRef,
    );
  }, [selected, selectedIsHidden]);
  const markMeasurementStale = useCallback(() => {
    setIsMeasuring(true);
  }, []);

  const measureVisibleCount = useCallback(
    (pinnedValue?: string) => {
      const element = container.current;
      if (!element) {
        return null;
      }

      const maxWidth = getAvailableWidth(element);
      const styles = ownerWindow(element).getComputedStyle(element);
      const gap = getGapValue(styles);
      const overflowWidth = overflowButton.current
        ? overflowButton.current.offsetWidth + gap
        : 0;
      const measuredTabs = tabs.map((tab) => ({
        value: tab.value,
        width: getTabWidth(tab),
      }));

      return calculateVisibleCount({
        gap,
        maxWidth,
        overflowWidth,
        pinnedValue,
        tabs: measuredTabs,
      });
    },
    [container, overflowButton, tabs],
  );
  const clearMeasureRetry = useCallback(() => {
    const element = container.current;
    const frame = measureRetryFrameRef.current;

    if (element && frame != null) {
      ownerWindow(element).cancelAnimationFrame(frame);
    }

    measureRetryFrameRef.current = null;
    measureRetryCountRef.current = 0;
  }, [container]);

  useEffect(() => {
    return clearMeasureRetry;
  }, [clearMeasureRetry]);

  useIsomorphicLayoutEffect(() => {
    if (selected !== undefined && selectedIsHidden) {
      pinnedSelectionRef.current = selected;
      const nextVisibleCount = measureVisibleCount(selected);
      if (nextVisibleCount == null) {
        markMeasurementStale();
        return;
      }
      if (nextVisibleCount !== visibleCount) {
        setVisibleCount(nextVisibleCount);
      }
      if (isMeasuring) {
        setIsMeasuring(false);
      }
    }
  }, [
    isMeasuring,
    markMeasurementStale,
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
        if (isHTMLElement(child) && child !== element) {
          observedElements.push(child);
        }
      }
    }

    const widths = seedWidthMap(observedElements);
    const resizeObserverCtor = ownerWindow(element).ResizeObserver;
    if (!resizeObserverCtor) {
      return;
    }

    const resizeObserver = new resizeObserverCtor(
      (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          if (!isHTMLElement(entry.target)) {
            continue;
          }

          const nextWidth = entry.contentRect.width;
          if (updateWidthMap(widths, entry.target, nextWidth)) {
            const nextVisibleCount = measureVisibleCount(
              getCurrentPinnedValue(),
            );

            if (nextVisibleCount != null && nextVisibleCount === visibleCount) {
              continue;
            }

            markMeasurementStale();
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
  }, [
    container,
    getCurrentPinnedValue,
    isMeasuring,
    markMeasurementStale,
    measureVisibleCount,
    menuOpen,
    visibleCount,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (previousMenuOpenRef.current && !menuOpen) {
      markMeasurementStale();
    }

    previousMenuOpenRef.current = menuOpen;
  }, [markMeasurementStale, menuOpen]);

  useIsomorphicLayoutEffect(() => {
    const nextOverflowButtonWidth = overflowButton.current?.offsetWidth ?? 0;
    if (previousOverflowButtonWidthRef.current === nextOverflowButtonWidth) {
      return;
    }

    previousOverflowButtonWidthRef.current = nextOverflowButtonWidth;
    if (visibleCount < tabs.length) {
      markMeasurementStale();
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (previousMeasurementInputKeyRef.current !== measurementInputKey) {
      previousMeasurementInputKeyRef.current = measurementInputKey;
      markMeasurementStale();
    }
  }, [markMeasurementStale, measurementInputKey]);

  useIsomorphicLayoutEffect(() => {
    // A content-only tab width update can briefly leave a tab without a
    // trustworthy measured width after it moves through the portal slots.
    // Retry on the next frame instead of leaving overflow stuck measuring.
    void measureRetryVersion;

    if (!isMeasuring || menuOpen) {
      return;
    }

    const nextVisibleCount = measureVisibleCount(getCurrentPinnedValue());

    if (nextVisibleCount == null) {
      if (measureRetryFrameRef.current != null) {
        return;
      }

      const element = container.current;
      if (!element || getMeasuredWidth(element) <= MIN_TRUSTED_TAB_WIDTH) {
        measureRetryCountRef.current = 0;
        return;
      }

      if (measureRetryCountRef.current >= 5) {
        return;
      }

      measureRetryCountRef.current += 1;
      measureRetryFrameRef.current = ownerWindow(element).requestAnimationFrame(
        () => {
          measureRetryFrameRef.current = null;
          setMeasureRetryVersion((currentVersion) => currentVersion + 1);
        },
      );
      return;
    }

    clearMeasureRetry();

    setVisibleCount(nextVisibleCount);
    setIsMeasuring(false);
  }, [
    clearMeasureRetry,
    container.current,
    getCurrentPinnedValue,
    isMeasuring,
    measureRetryVersion,
    measureVisibleCount,
    menuOpen,
  ]);

  const { visibleValues, hiddenValues } = partitionVisibleValues(
    orderedValues,
    visibleCount,
    pinnedValue,
  );

  return [visibleValues, hiddenValues, isMeasuring] as const;
}
