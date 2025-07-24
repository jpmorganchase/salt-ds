import { useControlled } from "@salt-ds/core";
import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CollectionItem } from "./collectionTypes";
import {
  ArrowDown,
  ArrowUp,
  End,
  Home,
  isCharacterKey,
  isNavigationKey,
  PageDown,
  PageUp,
} from "./keyUtils";
import type {
  NavigationHookProps,
  NavigationHookResult,
} from "./navigationTypes";
import {
  getFirstSelectedItem,
  hasSelection,
  type SelectionStrategy,
} from "./selectionTypes";

export const LIST_FOCUS_VISIBLE = -2;

function nextItemIdx(count: number, key: string, idx: number) {
  if (key === ArrowUp || key === End) {
    if (idx > 0) {
      return idx - 1;
    }
    return idx;
  }
  if (idx === null) {
    return 0;
  }
  if (idx === count - 1) {
    return idx;
  }
  return idx + 1;
}

const getIndexOfSelectedItem = (
  items: CollectionItem<unknown>[],
  selected?: CollectionItem<unknown> | null | CollectionItem<unknown>[],
) => {
  const selectedItem = getFirstSelectedItem(selected);
  if (selectedItem) {
    return items.indexOf(selectedItem);
  }
  return -1;
};

const getStartIdx = (
  key: string,
  idx: number,
  selectedIdx: number,
  length: number,
) => {
  if (key === End) {
    return length;
  }
  if (key === Home) {
    return -1;
  }
  if (idx !== -1) {
    return idx;
  }
  return selectedIdx;
};

const getItemRect = (item: CollectionItem<unknown>) => {
  const el = document.getElementById(item.id);
  if (el) {
    return el.getBoundingClientRect();
  }
  throw Error(
    `useKeyboardNavigation.getItemRect no element found for item  #${item?.id}`,
  );
};

const pageDown = (
  containerEl: HTMLElement,
  itemEl: HTMLElement,
  indexPositions: CollectionItem<unknown>[],
  index: number,
): number | undefined => {
  const { top: itemTop } = itemEl.getBoundingClientRect();
  const { scrollTop, clientHeight, scrollHeight } = containerEl;
  const lastIndexPosition = indexPositions.length - 1;
  const newScrollTop = Math.min(
    scrollTop + clientHeight,
    scrollHeight - clientHeight,
  );
  if (newScrollTop !== scrollTop && index < lastIndexPosition) {
    containerEl.scrollTo(0, newScrollTop);
    // Might need to do this in a timeout, in case virtualized content has rendered
    let nextIdx = index;
    let nextRect: DOMRect;
    do {
      nextIdx += 1;
      nextRect = getItemRect(indexPositions[nextIdx]);
    } while (nextRect.top < itemTop && nextIdx < lastIndexPosition);
    return nextIdx;
  }
};

const pageUp = async (
  containerEl: HTMLElement,
  itemEl: HTMLElement,
  indexPositions: CollectionItem<unknown>[],
  index: number,
): Promise<number | undefined> => {
  const { top: itemTop } = itemEl.getBoundingClientRect();
  const { scrollTop, clientHeight } = containerEl;
  const newScrollTop = Math.max(scrollTop - clientHeight, 0);
  if (newScrollTop !== scrollTop && index > 0) {
    containerEl.scrollTo(0, newScrollTop);
    return new Promise((resolve) => {
      // We must defer this operation until after render. If Items are virtualized.
      // we need to allow them to be rendered.
      requestAnimationFrame(() => {
        let nextIdx = index;
        let nextRect: DOMRect;
        do {
          nextIdx -= 1;
          nextRect = getItemRect(indexPositions[nextIdx]);
        } while (nextRect.top > itemTop && nextIdx > 0);
        resolve(nextIdx);
      });
    });
  }
};

const isLeaf = <Item>(item: CollectionItem<Item>): boolean =>
  !item.header && !item.childNodes;
const isFocusable = <Item>(item: CollectionItem<Item>) =>
  isLeaf(item) || item.expanded !== undefined;

export const useKeyboardNavigation = <
  Item,
  Selection extends SelectionStrategy,
>({
  containerRef,
  defaultHighlightedIndex = -1,
  disableHighlightOnFocus,
  highlightedIndex: highlightedIndexProp,
  indexPositions,
  onHighlight,
  onKeyboardNavigation,
  restoreLastFocus,
  selected,
}: NavigationHookProps<Item, Selection>): NavigationHookResult => {
  const lastFocus = useRef(-1);
  const [, forceRender] = useState({});
  const [highlightedIndex, setHighlightedIdx, isControlledHighlighting] =
    useControlled({
      controlled: highlightedIndexProp,
      default: defaultHighlightedIndex,
      name: "UseKeyboardNavigation",
    });

  const setHighlightedIndex = useCallback(
    (idx: number, fromKeyboard = false) => {
      onHighlight?.(idx);
      setHighlightedIdx(idx);
      if (fromKeyboard) {
        lastFocus.current = idx;
      }
    },
    [onHighlight],
  );

  const nextPageItemIdx = useCallback(
    async (e: KeyboardEvent<HTMLElement>, index: number): Promise<number> => {
      const { id } = indexPositions[index];
      let result: number | undefined;
      if (id) {
        const itemEl = document.getElementById(id);
        const { current: containerEl } = containerRef;
        if (itemEl && containerEl) {
          result =
            e.key === PageDown
              ? pageDown(containerEl, itemEl, indexPositions, index)
              : await pageUp(containerEl, itemEl, indexPositions, index);
        }
      }
      return result ?? index;
    },
    [containerRef, indexPositions],
  );

  const nextFocusableItemIdx = useCallback(
    (
      key = ArrowDown,
      idx: number = key === ArrowDown ? -1 : indexPositions.length,
    ) => {
      if (indexPositions.length === 0) {
        return -1;
      }
      const indexOfSelectedItem = getIndexOfSelectedItem(
        indexPositions,
        selected,
      );
      // The start index is generally the highlightedIdx (passed in as idx).
      // We don't need it for Home and End navigation.
      // Special case where we have selection, but no highlighting - begin
      // navigation from selected item.
      const startIdx = getStartIdx(
        key,
        idx,
        indexOfSelectedItem,
        indexPositions.length,
      );

      let nextIdx = nextItemIdx(indexPositions.length, key, startIdx);
      // Guard against returning zero, when first item is a header or group
      if (nextIdx === 0 && key === ArrowUp && !isFocusable(indexPositions[0])) {
        return idx;
      }
      while (
        (((key === ArrowDown || key === Home) &&
          nextIdx < indexPositions.length) ||
          ((key === ArrowUp || key === End) && nextIdx > 0)) &&
        !isFocusable(indexPositions[nextIdx])
      ) {
        nextIdx = nextItemIdx(indexPositions.length, key, nextIdx);
      }
      return nextIdx;
    },
    [indexPositions, selected],
  );

  // does this belong here or should it be a method passed in?
  const keyboardNavigation = useRef(false);
  const ignoreFocus = useRef<boolean>(false);
  const setIgnoreFocus = useCallback(
    (value: boolean) => (ignoreFocus.current = value),
    [],
  );

  const handleFocus = useCallback(() => {
    // Ignore focus if mouse has been used
    if (ignoreFocus.current) {
      ignoreFocus.current = false;
    } else {
      // If mouse wan't used, then keyboard must have been
      keyboardNavigation.current = true;
      if (indexPositions.length === 0) {
        setHighlightedIndex(LIST_FOCUS_VISIBLE);
      } else if (highlightedIndex !== -1) {
        // We need to force a render here. We're not changing the highlightedIdx, but we want to
        // make sure we render with the correct focusVisible value. We don't store focusVisible
        // in state, as there are places where we would double render, as highlightedIdx also changes.
        forceRender({});
      } else if (restoreLastFocus) {
        if (lastFocus.current !== -1) {
          setHighlightedIndex(lastFocus.current);
        } else {
          const selectedItemIdx = getIndexOfSelectedItem(
            indexPositions,
            selected,
          );
          if (selectedItemIdx !== -1) {
            setHighlightedIndex(selectedItemIdx);
          } else {
            setHighlightedIndex(0);
          }
        }
      } else if (hasSelection(selected)) {
        const selectedItemIdx = getIndexOfSelectedItem(
          indexPositions,
          selected,
        );
        setHighlightedIndex(selectedItemIdx);
      } else if (disableHighlightOnFocus !== true) {
        setHighlightedIndex(nextFocusableItemIdx());
      }
    }
  }, [
    disableHighlightOnFocus,
    highlightedIndex,
    indexPositions,
    nextFocusableItemIdx,
    restoreLastFocus,
    selected,
    setHighlightedIndex,
  ]);

  const navigateChildItems = useCallback(
    async (e: KeyboardEvent<HTMLElement>) => {
      const nextIdx =
        e.key === PageDown || e.key === PageUp
          ? await nextPageItemIdx(e, highlightedIndex)
          : nextFocusableItemIdx(e.key, highlightedIndex);

      if (nextIdx !== highlightedIndex) {
        setHighlightedIndex(nextIdx, true);
      }
      // Users may need to know that a Keyboard navigation event has been handled
      // even if no actual navigation was effected. e.g. fine-grained control
      // over aria-activedescendant requires this.
      onKeyboardNavigation?.(e, nextIdx);
    },
    [
      highlightedIndex,
      nextFocusableItemIdx,
      nextPageItemIdx,
      onKeyboardNavigation,
      setHighlightedIndex,
    ],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (indexPositions.length > 0 && isNavigationKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        keyboardNavigation.current = true;
        void navigateChildItems(e);
      } else if (isCharacterKey(e)) {
        keyboardNavigation.current = true;
      }
    },
    [indexPositions, navigateChildItems],
  );

  const listProps = useMemo(() => {
    return {
      onBlur: (e: FocusEvent) => {
        //TODO no direct ref to List
        const sourceTarget = (e.target as HTMLElement).closest(".saltList");
        const destTarget = e.relatedTarget as HTMLElement;
        if (sourceTarget && !sourceTarget?.contains(destTarget)) {
          keyboardNavigation.current = false;
          setHighlightedIdx(-1);
          if (!restoreLastFocus) {
            lastFocus.current = -1;
          }
        }
      },
      onFocus: handleFocus,
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
        keyboardNavigation.current = false;
        setIgnoreFocus(false);
        setHighlightedIndex(-1);
      },
    };
  }, [
    handleFocus,
    handleKeyDown,
    restoreLastFocus,
    setHighlightedIndex,
    setIgnoreFocus,
  ]);

  return {
    focusVisible: keyboardNavigation.current ? highlightedIndex : -1,
    controlledHighlighting: isControlledHighlighting,
    highlightedIndex,
    setHighlightedIndex,
    keyboardNavigation,
    listProps,
    setIgnoreFocus,
  };
};
