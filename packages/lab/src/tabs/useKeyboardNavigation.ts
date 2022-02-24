import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { useChildRefs } from "../utils";
import { isTabElement } from "./tab-utils";

const navigationKeys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

const isNavigationKey = (key: string) => navigationKeys.has(key);

type keyboardNavigationHook = (options: {
  itemCount: number;
  keyBoardActivation?: "manual" | "automatic";
  orientation: "vertical" | "horizontal";
  value: number;
}) => {
  focusedIndex: number;
  focusTab: (tabIndex: number, immediateFocus?: boolean) => void;
  navItemRefs: RefObject<Array<RefObject<HTMLElement>>>;
  onBlur: (evt: FocusEvent<HTMLElement>) => void;
  onClick: (evt: MouseEvent, tabIndex: number) => void;
  onFocus: (evt: FocusEvent<HTMLElement>) => void;
  onKeyDown: (evt: KeyboardEvent, tabIndex: number) => void;
};

export const useKeyboardNavigation: keyboardNavigationHook = ({
  itemCount,
  keyBoardActivation,
  orientation,
  value: selectedTabIndex = 0,
}) => {
  const [navItemRefs, getTabRef] = useChildRefs<HTMLElement>(itemCount);
  const manualActivation = keyBoardActivation === "manual";
  const vertical = orientation === "vertical";
  const focusedRef = useRef<number>(-1);
  const [focusedIndex, _setFocusedIndex] = useState<number>(-1);
  const setFocusedIndex = (value: number) => {
    _setFocusedIndex((focusedRef.current = value));
  };

  const getFocusableChild = (el: HTMLElement) => el.querySelector("[tabindex]");

  const getFocusable = useCallback(
    (tabIndex: number): HTMLElement | undefined => {
      const tab = getTabRef(tabIndex);
      if (tab) {
        if (tab.getAttribute("tabindex") !== null) {
          return tab;
        } else {
          const focusableChild = getFocusableChild(tab);
          return focusableChild as HTMLElement;
        }
      }
    },
    [getTabRef]
  );

  const focusTab = useCallback(
    (tabIndex: number, immediateFocus = false) => {
      // The timeout is important in two scenarios:
      // 1) where tab has overflowed and is being selected from overflow menu.
      // We must not focus it until the overflow mechanism + render has restored
      // it to the main display.
      // 2) when we are focussing a new tab
      // We MUST NOT delay focus when using keyboard nav, else when focus moves from
      // close button (focus ring styled by :focus-visible) to Tab label (focus ring
      // styled by css class) focus style will briefly linger on both.
      setFocusedIndex(tabIndex);
      const setFocus = () => {
        const focussableElement = getFocusable(tabIndex);
        focussableElement?.focus();
      };
      if (immediateFocus) {
        setFocus();
      } else {
        setTimeout(setFocus, 70);
      }
    },
    [getFocusable]
  );

  // Navigate next/previous Tab. Visible Tabs are those that have not overflowed
  // and been banished to overflow menu.
  const lastVisibleTabIndex = (): number => {
    if (navItemRefs.current !== null) {
      return moveTabIndex(navItemRefs.current.length, -1);
    } else {
      return -1;
    }
  };

  const firstVisibleTabIndex = (): number => moveTabIndex(-1, +1);

  const nextVisibleTabIndex = (tabIndex: number): number => {
    return moveTabIndex(tabIndex, +1, firstVisibleTabIndex);
  };

  const previousVisibleTabIndex = (tabIndex: number): number => {
    return moveTabIndex(tabIndex, -1, lastVisibleTabIndex);
  };

  const moveTabIndex = (
    start: number,
    increment: 1 | -1,
    fallback: () => number | undefined = () => undefined
  ): number => {
    let newTabIndex = start + increment;
    let tabElement = getTabRef(newTabIndex);
    while (tabElement && tabElement.dataset.overflowed === "true") {
      newTabIndex += increment;
      tabElement = getTabRef(newTabIndex);
    }

    if (!tabElement) {
      newTabIndex = fallback() ?? start;
    }
    return newTabIndex;
  };

  function switchTabOnKeyPress(e: KeyboardEvent, tabIndex: number) {
    const { key } = e;

    const newTabIndex = navigateTabIndex(key, tabIndex);

    if (newTabIndex === tabIndex) {
      return;
    }

    e.preventDefault();
    const immediateFocus = true;

    if (newTabIndex !== tabIndex) {
      if (manualActivation) {
        focusTab(newTabIndex, immediateFocus);
      } else {
        // activateTab(newTabIndex);
      }
    }
  }

  function navigateTabIndex(key: string, tabIndex: number): number {
    const stayWhereWeAre: number = tabIndex;
    switch (key) {
      case "ArrowLeft":
        return vertical ? stayWhereWeAre : previousVisibleTabIndex(tabIndex);
      case "ArrowUp":
        return vertical ? previousVisibleTabIndex(tabIndex) : stayWhereWeAre;
      case "ArrowRight":
        return vertical ? stayWhereWeAre : nextVisibleTabIndex(tabIndex);
      case "ArrowDown":
        return vertical ? nextVisibleTabIndex(tabIndex) : stayWhereWeAre;
      case "End":
        return lastVisibleTabIndex();
      case "Home":
        return firstVisibleTabIndex();
      default:
        return stayWhereWeAre;
    }
  }

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    const target = e.relatedTarget as HTMLElement;
    if (!isTabElement(target)) {
      // TODO what about the overflow menu
      setFocusedIndex(-1);
    }
  };
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
            setFocusedIndex(selectedTabIndex);
          }
        }, 200);
      }
    }
  };
  const onKeyDown = (e: KeyboardEvent, tabIndex: number) => {
    if (isNavigationKey(e.key)) {
      e.preventDefault();
      switchTabOnKeyPress(e, tabIndex);
    }
  };
  const onClick = (e: MouseEvent, tabIndex: number) => {
    setFocusedIndex(-1);
  };

  return {
    focusedIndex,
    focusTab,
    navItemRefs,
    onBlur,
    onClick,
    onFocus,
    onKeyDown,
  };
};
