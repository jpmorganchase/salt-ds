import { useControlled } from "@salt-ds/core";
import { type KeyboardEvent, useCallback, useMemo, useRef } from "react";
import type { CollectionItem } from "./collectionTypes";
import type { NavigationHookResult, NavigationProps } from "./navigationTypes";

type NavigationDirection = "FWD" | "BWD";

function nextItemIdx(
  count: number,
  direction: NavigationDirection,
  idx: number,
  cycleFocus = false,
) {
  if (direction === "BWD") {
    if (idx > 0) {
      return idx - 1;
    }
    return cycleFocus ? count - 1 : idx;
  }
  if (idx === null) {
    return 0;
  }
  if (idx === count - 1) {
    return cycleFocus ? 0 : idx;
  }
  return idx + 1;
}

const isLeaf = <Item>(item: CollectionItem<Item>): boolean =>
  !item.header && !item.childNodes;
const isFocusable = <Item>(item: CollectionItem<Item>) =>
  (isLeaf(item) || item.expanded !== undefined) && item.focusable !== false;

// we need a way to set highlightedIdx when selection changes
export const useKeyboardNavigationPanel = ({
  cycleFocus = false,
  defaultHighlightedIndex: defaultHighlightedIdx = -1,
  focusOnHighlight = false,
  highlightedIndex: highlightedIdxProp,
  indexPositions,
  onHighlight,
  onKeyboardNavigation,
}: NavigationProps): NavigationHookResult => {
  const [highlightedIdx, setHighlightedIdx, isControlledHighlighting] =
    useControlled({
      controlled: highlightedIdxProp,
      default: defaultHighlightedIdx,
      name: "UseKeyboardNavigation",
    });

  // does this belong here or should it be a method passed in?
  const keyboardNavigation = useRef(true);
  const ignoreFocus = useRef<boolean>(false);
  const setIgnoreFocus = useCallback(
    (value: boolean) => (ignoreFocus.current = value),
    [],
  );

  const setHighlightedIndex = useCallback(
    (idx: number) => {
      onHighlight?.(idx);
      setHighlightedIdx(idx);
      if (focusOnHighlight && idx !== -1) {
        const { id } = indexPositions[idx];
        const formField = document.getElementById(id);
        const targetEl = formField?.querySelector("[tabindex]") as HTMLElement;
        setIgnoreFocus(true);
        targetEl?.focus();
      }
    },
    [focusOnHighlight, indexPositions, onHighlight, setIgnoreFocus],
  );

  const nextFocusableItemIdx = useCallback(
    (
      direction: NavigationDirection = "FWD",
      idx = direction === "FWD" ? -1 : indexPositions.length,
    ) => {
      let nextIdx = nextItemIdx(
        indexPositions.length,
        direction,
        idx,
        cycleFocus,
      );
      while (
        ((direction === "FWD" && nextIdx < indexPositions.length) ||
          (direction === "BWD" && nextIdx > 0)) &&
        !isFocusable(indexPositions[nextIdx])
      ) {
        nextIdx = nextItemIdx(
          indexPositions.length,
          direction,
          nextIdx,
          cycleFocus,
        );
      }
      return nextIdx;
    },
    [cycleFocus, indexPositions],
  );

  const handleFocus = useCallback(() => {
    if (ignoreFocus.current) {
      ignoreFocus.current = false;
    } else {
      setHighlightedIndex(nextFocusableItemIdx());
    }
  }, [nextFocusableItemIdx, setHighlightedIndex]);

  const navigateChildItems = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const direction: NavigationDirection = e.shiftKey ? "BWD" : "FWD";
      const nextIdx = nextFocusableItemIdx(direction, highlightedIdx);
      console.log(`nextFocusableItem from ${highlightedIdx} is ${nextIdx}`);
      if (nextIdx !== highlightedIdx) {
        setHighlightedIndex(nextIdx);
        // What exactly is the point of this ?
        onKeyboardNavigation?.(e, nextIdx);
      }
    },
    [
      highlightedIdx,
      nextFocusableItemIdx,
      onKeyboardNavigation,
      setHighlightedIndex,
    ],
  );

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLElement>) => {
      if (indexPositions.length > 0 && evt.key === "Tab") {
        evt.preventDefault();
        evt.stopPropagation();
        keyboardNavigation.current = true;
        navigateChildItems(evt);
      }
    },
    [indexPositions, navigateChildItems],
  );

  const listProps = useMemo(
    () => ({
      onBlur: () => {
        // This sets highlightedIdx to -1 before a click on ListItem can effect selection
        // maybe in a timeout
        // setHighlightedIndex(-1);
      },
      onFocus: handleFocus,
      // Does this have to be capture ? We'll have to change the types
      // onKeyDownCapture: handleKeyDown,
      onKeyDown: handleKeyDown,
      onMouseDownCapture: () => {
        keyboardNavigation.current = false;
        setIgnoreFocus(true);
      },

      // onMouseEnter would seem less expensive but it misses some cases
      onMouseMove: () => {
        if (keyboardNavigation.current) {
          keyboardNavigation.current = false;
        }
      },
      onMouseLeave: () => {
        keyboardNavigation.current = true;
        setIgnoreFocus(false);
        setHighlightedIndex(-1);
      },
    }),
    [handleFocus, handleKeyDown, setHighlightedIndex, setIgnoreFocus],
  );

  return {
    focusVisible: keyboardNavigation.current ? highlightedIdx : -1,
    controlledHighlighting: isControlledHighlighting,
    highlightedIndex: highlightedIdx,
    setHighlightedIndex,
    keyboardNavigation,
    listProps,
    setIgnoreFocus,
  };
};
