import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../../../utils";
import type {
  TabListLayoutContextValue,
  TabSlotLocation,
} from "../contexts/TabListLayoutContext";

function getOverflowStartIndex(
  hiddenValues: string[],
  currentValue: string,
  fallbackValue: string | null,
) {
  const currentIndex = hiddenValues.indexOf(currentValue);
  const fallbackIndex =
    fallbackValue != null ? hiddenValues.indexOf(fallbackValue) : 0;

  return currentIndex >= 0 ? currentIndex : Math.max(0, fallbackIndex);
}

interface UseOverflowLayoutStateArgs {
  exitOverflowMenu: () => void;
  hiddenValues: string[];
  menuOpen: boolean;
  overflowMenuOpen: boolean;
  visibleValues: string[];
}

interface UseOverflowLayoutStateResult {
  resolvedOverflowActiveValue: string | null;
  tabListLayoutContext: TabListLayoutContextValue;
}

export function useOverflowLayoutState({
  exitOverflowMenu,
  hiddenValues,
  menuOpen,
  overflowMenuOpen,
  visibleValues,
}: UseOverflowLayoutStateArgs): UseOverflowLayoutStateResult {
  const [requestedOverflowActiveValue, setRequestedOverflowActiveValue] =
    useState<string | null>(null);

  useEffect(() => {
    if (!overflowMenuOpen) {
      setRequestedOverflowActiveValue(null);
    }
  }, [overflowMenuOpen]);

  const previousHiddenValuesRef = useRef(hiddenValues);

  const resolvedOverflowActiveValue = useMemo(() => {
    if (!overflowMenuOpen) {
      return null;
    }

    if (
      requestedOverflowActiveValue &&
      hiddenValues.includes(requestedOverflowActiveValue)
    ) {
      return requestedOverflowActiveValue;
    }

    // When the active overflow tab leaves the menu (e.g. it is removed), keep
    // the active position rather than jumping back to the first tab.
    const previousIndex = requestedOverflowActiveValue
      ? previousHiddenValuesRef.current.indexOf(requestedOverflowActiveValue)
      : -1;
    if (previousIndex >= 0) {
      return (
        hiddenValues[Math.min(previousIndex, hiddenValues.length - 1)] ?? null
      );
    }

    return hiddenValues[0] ?? null;
  }, [hiddenValues, overflowMenuOpen, requestedOverflowActiveValue]);

  useIsomorphicLayoutEffect(() => {
    previousHiddenValuesRef.current = hiddenValues;
  }, [hiddenValues]);

  // The fallback above relies on the previous render's hidden values, so it
  // only holds for one render. Adopt it as the requested value so later
  // renders keep the position rather than falling back to the first tab.
  useIsomorphicLayoutEffect(() => {
    if (
      requestedOverflowActiveValue &&
      resolvedOverflowActiveValue &&
      requestedOverflowActiveValue !== resolvedOverflowActiveValue
    ) {
      setRequestedOverflowActiveValue(resolvedOverflowActiveValue);
    }
  }, [requestedOverflowActiveValue, resolvedOverflowActiveValue]);

  const hiddenValueSet = useMemo(() => new Set(hiddenValues), [hiddenValues]);
  const visibleValueSet = useMemo(
    () => new Set(visibleValues),
    [visibleValues],
  );

  const getLocation = useCallback(
    (value: string): TabSlotLocation => {
      if (visibleValueSet.has(value)) {
        return "main";
      }

      if (menuOpen && hiddenValueSet.has(value)) {
        return "overflow";
      }

      return "hidden";
    },
    [hiddenValueSet, menuOpen, visibleValueSet],
  );

  const moveOverflowFocus = useCallback(
    (key: "ArrowDown" | "ArrowUp" | "Home" | "End", value: string) => {
      if (hiddenValues.length < 1) {
        return false;
      }

      const startIndex = getOverflowStartIndex(
        hiddenValues,
        value,
        resolvedOverflowActiveValue,
      );
      const lastIndex = hiddenValues.length - 1;
      let nextIndex = startIndex;

      switch (key) {
        case "ArrowDown":
          nextIndex = startIndex >= lastIndex ? 0 : startIndex + 1;
          break;
        case "ArrowUp":
          nextIndex = startIndex <= 0 ? lastIndex : startIndex - 1;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = lastIndex;
          break;
      }

      const nextValue = hiddenValues[nextIndex];
      if (!nextValue) {
        return false;
      }

      setRequestedOverflowActiveValue(nextValue);
      return true;
    },
    [hiddenValues, resolvedOverflowActiveValue],
  );

  const tabListLayoutContext = useMemo(
    () => ({
      exitOverflowMenu,
      getLocation,
      overflowActiveValue: resolvedOverflowActiveValue,
      setOverflowActiveValue: setRequestedOverflowActiveValue,
      moveOverflowFocus,
    }),
    [
      exitOverflowMenu,
      getLocation,
      moveOverflowFocus,
      resolvedOverflowActiveValue,
    ],
  );

  return {
    resolvedOverflowActiveValue,
    tabListLayoutContext,
  };
}
