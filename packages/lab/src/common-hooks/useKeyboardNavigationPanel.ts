import { useControlled } from "@jpmorganchase/uitk-core";
import { KeyboardEvent, useCallback, useMemo, useRef } from "react";
import { ArrowDown, ArrowUp, isNavigationKey } from "./key-code";
import { CollectionItem } from "./collectionTypes";
import { NavigationProps, NavigationHookResult } from "./navigationTypes";

function nextItemIdx(
  count: number,
  key: string,
  idx: number,
  cycleFocus = false
) {
  if (key === ArrowUp) {
    if (idx > 0) {
      return idx - 1;
    } else {
      return cycleFocus ? count - 1 : idx;
    }
  } else {
    if (idx === null) {
      return 0;
    } else if (idx === count - 1) {
      return cycleFocus ? 0 : idx;
    } else {
      return idx + 1;
    }
  }
}

const isLeaf = <Item>(item: CollectionItem<Item>): boolean =>
  !item.header && !item.childNodes;
const isFocusable = <Item>(item: CollectionItem<Item>) =>
  isLeaf(item) || item.expanded !== undefined;

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
    [focusOnHighlight, indexPositions, onHighlight, setHighlightedIdx]
  );

  const nextFocusableItemIdx = useCallback(
    (key = ArrowDown, idx = key === ArrowDown ? -1 : indexPositions.length) => {
      let nextIdx = nextItemIdx(indexPositions.length, key, idx, cycleFocus);
      while (
        ((key === ArrowDown && nextIdx < indexPositions.length) ||
          (key === ArrowUp && nextIdx > 0)) &&
        !isFocusable(indexPositions[nextIdx])
      ) {
        nextIdx = nextItemIdx(indexPositions.length, key, nextIdx, cycleFocus);
      }
      return nextIdx;
    },
    [cycleFocus, indexPositions]
  );

  // does this belong here or should it be a method passed in?
  const keyboardNavigation = useRef(true);
  const ignoreFocus = useRef<boolean>(false);
  const setIgnoreFocus = (value: boolean) => (ignoreFocus.current = value);

  const handleFocus = useCallback(() => {
    if (ignoreFocus.current) {
      ignoreFocus.current = false;
    } else {
      setHighlightedIndex(nextFocusableItemIdx());
    }
  }, [nextFocusableItemIdx, setHighlightedIndex]);

  const navigateChildItems = useCallback(
    (e: React.KeyboardEvent) => {
      const nextIdx = nextFocusableItemIdx(e.key, highlightedIdx);
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
    ]
  );

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      console.log("useKeyboardNavigationPanel handleKeyDown");
      if (indexPositions.length > 0 && isNavigationKey(evt)) {
        evt.preventDefault();
        evt.stopPropagation();
        keyboardNavigation.current = true;
        navigateChildItems(evt);
      }
    },
    [indexPositions, navigateChildItems]
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
    [handleFocus, handleKeyDown, setHighlightedIndex]
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
