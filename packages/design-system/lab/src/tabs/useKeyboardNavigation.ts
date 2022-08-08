import {
  useControlled,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import {
  FocusEvent,
  FocusEventHandler,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import { OverflowItem } from "../responsive";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Home,
  End,
} from "../common-hooks";

type orientationType = "horizontal" | "vertical";
type directionType = "bwd" | "fwd" | "start" | "end";
type directionMap = { [key: string]: directionType };
const navigation = {
  horizontal: {
    [Home]: "start",
    [End]: "end",
    [ArrowLeft]: "bwd",
    [ArrowRight]: "fwd",
  } as directionMap,
  vertical: {
    [Home]: "start",
    [End]: "end",
    [ArrowUp]: "bwd",
    [ArrowDown]: "fwd",
  } as directionMap,
};

const isNavigationKey = (
  key: string,
  orientation: orientationType = "horizontal"
) => navigation[orientation][key] !== undefined;

function nextItemIdx(count: number, direction: directionType, idx: number) {
  if (direction === "start") {
    return 0;
  } else if (direction === "end") {
    return count - 1;
  } else if (direction === "bwd") {
    if (idx > 0) {
      return idx - 1;
    } else {
      return idx;
    }
  } else {
    if (idx === null) {
      return 0;
    } else if (idx === count - 1) {
      return idx;
    } else {
      return idx + 1;
    }
  }
}

const isFocusable = (item: OverflowItem) => !item.overflowed;
const getFocusableElement = (el: HTMLElement | null) =>
  el
    ? el.hasAttribute("tabindex")
      ? el
      : (el.querySelector("[tabindex]") as HTMLElement)
    : null;

export interface ContainerNavigationProps {
  onBlur: FocusEventHandler;
  onFocus: FocusEventHandler;
  onMouseDownCapture: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
  onMouseMove: MouseEventHandler;
}

interface TabstripNavigationHookProps {
  defaultHighlightedIdx?: number;
  highlightedIdx?: number;
  indexPositions: OverflowItem[];
  keyBoardActivation?: "manual" | "automatic";
  orientation: orientationType;
  selectedIndex: number;
}

interface TabstripNavigationHookResult {
  containerProps: ContainerNavigationProps;
  highlightedIdx: number;
  focusTab: (
    tabIndex: number,
    immediateFocus?: boolean,
    withKeyboard?: boolean
  ) => void;
  focusVisible: number;
  focusIsWithinComponent: boolean;
  onClick: (evt: MouseEvent, tabIndex: number) => void;
  onFocus: (evt: FocusEvent<HTMLElement>) => void;
  onKeyDown: (evt: KeyboardEvent) => void;
}

export const useKeyboardNavigation = ({
  defaultHighlightedIdx = -1,
  highlightedIdx: highlightedIdxProp,
  indexPositions,
  keyBoardActivation,
  orientation,
  selectedIndex: selectedTabIndex = 0,
}: TabstripNavigationHookProps): TabstripNavigationHookResult => {
  const manualActivation = keyBoardActivation === "manual";
  const mouseClickPending = useRef(false);
  const focusedRef = useRef<number>(-1);
  const [hasFocus, setHasFocus] = useState(false);
  const [, forceRefresh] = useState({});
  const [highlightedIdx, _setHighlightedIdx] = useControlled({
    controlled: highlightedIdxProp,
    default: defaultHighlightedIdx,
    name: "UseKeyboardNavigation",
  });

  const setHighlightedIdx = useCallback(
    (value: number) => {
      _setHighlightedIdx((focusedRef.current = value));
    },
    [_setHighlightedIdx]
  );

  const keyboardNavigation = useRef(false);

  const focusTab = useCallback(
    (tabIndex: number, immediateFocus = false, withKeyboard?: boolean) => {
      // The timeout is important in two scenarios:
      // 1) where tab has overflowed and is being selected from overflow menu.
      // We must not focus it until the overflow mechanism + render has restored
      // it to the main display.
      // 2) when we are focussing a new tab
      // We MUST NOT delay focus when using keyboard nav, else when focus moves from
      // close button (focus ring styled by :focus-visible) to Tab label (focus ring
      // styled by css class) focus style will briefly linger on both.
      setHighlightedIdx(tabIndex);

      if (withKeyboard === true && !keyboardNavigation.current) {
        keyboardNavigation.current = true;
      }

      const setFocus = () => {
        const item = indexPositions.find((i) => i.index === tabIndex);

        if (item) {
          const focussableElement = getFocusableElement(
            document.getElementById(item.id)
          );
          focussableElement?.focus();
        }
      };
      if (immediateFocus) {
        setFocus();
      } else {
        setTimeout(setFocus, 70);
      }
    },
    [indexPositions, setHighlightedIdx]
  );

  const onFocus = (e: FocusEvent<HTMLElement>) => {
    // If focus is received by keyboard navigation, item with tabindex 0 will receive
    // focus. If the item receiving focus has tabindex -1, then focus has been set
    // programatically. We must respect this and not reset focus to selected tab.
    if (focusedRef.current === -1) {
      // Focus is entering tabstrip. Assume keyboard - if it'a actually mouse-driven,
      // the click event will have set correct value.
      if (e.target.tabIndex === -1) {
        // Do nothing, assume focus is being passed back to button by closing dialog. Might need
        // to revisit this and add code here if we may get focus set programatically in other ways.
      } else {
        setTimeout(() => {
          // The selected tab will have tabIndex 0 make sure our internal state is aligned.
          if (focusedRef.current === -1) {
            setHighlightedIdx(selectedTabIndex);
          }
        }, 200);
      }
    }
  };

  const nextFocusableItemIdx = useCallback(
    (
      direction: directionType = "fwd",
      idx = direction === "fwd" ? -1 : indexPositions.length
    ) => {
      let nextIdx = nextItemIdx(indexPositions.length, direction, idx);
      const nextDirection =
        direction === "start" ? "fwd" : direction === "end" ? "bwd" : direction;
      while (
        ((nextDirection === "fwd" && nextIdx < indexPositions.length) ||
          (nextDirection === "bwd" && nextIdx > 0)) &&
        !isFocusable(indexPositions[nextIdx])
      ) {
        const newIdx = nextItemIdx(
          indexPositions.length,
          nextDirection,
          nextIdx
        );
        if (newIdx === nextIdx) {
          break;
        } else {
          nextIdx = newIdx;
        }
      }
      return nextIdx;
    },
    [indexPositions]
  );

  // forceFocusVisible supports an edge case - first or last Tab are clicked
  // then Left or Right Arrow keys are pressed, There will be no navigation
  // but focusVisible must be applied
  const navigateChildItems = useCallback(
    (e: React.KeyboardEvent, forceFocusVisible = false) => {
      const direction = navigation[orientation][e.key];
      const nextIdx = nextFocusableItemIdx(direction, highlightedIdx);
      if (nextIdx !== highlightedIdx) {
        const immediateFocus = true;
        if (manualActivation) {
          focusTab(nextIdx, immediateFocus);
        } else {
          // activateTab(newTabIndex);
        }
      } else if (forceFocusVisible) {
        forceRefresh({});
      }
    },
    [
      highlightedIdx,
      manualActivation,
      nextFocusableItemIdx,
      focusTab,
      orientation,
    ]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (indexPositions.length > 0 && isNavigationKey(e.key, orientation)) {
        e.preventDefault();
        if (keyboardNavigation.current) {
          navigateChildItems(e);
        } else {
          keyboardNavigation.current = true;
          navigateChildItems(e, true);
        }
      }
    },
    [indexPositions, navigateChildItems, orientation]
  );

  // TODO, in common hooks, we use mouse movement to track current highlighted
  // index, rather than rely on component item reporting it
  const handleItemClick = (_: MouseEvent, tabIndex: number) => {
    setHighlightedIdx(tabIndex);
  };

  const handleFocus = useCallback(
    (evt: FocusEvent) => {
      if (!hasFocus) {
        setHasFocus(true);
        if (!mouseClickPending.current) {
          keyboardNavigation.current = true;
        } else {
          mouseClickPending.current = false;
        }
      }
    },
    [hasFocus]
  );

  const handleContainerMouseDown = useCallback(
    (evt: MouseEvent) => {
      if (!hasFocus) {
        mouseClickPending.current = true;
      }
      keyboardNavigation.current = false;
    },
    [hasFocus]
  );

  const containerProps = {
    onBlur: (e: FocusEvent) => {
      const sourceTarget = (e.target as HTMLElement).closest(".uitkTabstrip");
      const destTarget = e.relatedTarget as HTMLElement;
      if (sourceTarget && !sourceTarget?.contains(destTarget)) {
        setHighlightedIdx(-1);
        setHasFocus(false);
      }
    },
    // onClick: handleContainerClick,
    onMouseDown: handleContainerMouseDown,
    onFocus: handleFocus,
    // onKeyDown: () => console.log("[useKeyboardNavigation] onKeyDown"),
    onMouseDownCapture: () => {
      // console.log("[useKeyboardNavigation onMouseDownCapture")
    },

    onMouseMove: () => {
      // console.log("[useKeyboardNavigation onMouseMove");
    },
    onMouseLeave: () => {
      keyboardNavigation.current = true;
      setHighlightedIdx(-1);
      mouseClickPending.current = false;
    },
  };

  useIsomorphicLayoutEffect(() => {
    if (hasFocus && selectedTabIndex !== undefined) {
      focusTab(selectedTabIndex);
    }
  }, [focusTab, hasFocus, selectedTabIndex]);

  return {
    containerProps,
    focusVisible: keyboardNavigation.current ? highlightedIdx : -1,
    focusIsWithinComponent: hasFocus,
    highlightedIdx,
    focusTab,
    onClick: handleItemClick,
    onFocus,
    onKeyDown: handleKeyDown,
  };
};
