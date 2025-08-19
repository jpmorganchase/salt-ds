import {
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

import type { CascadingMenuListProps } from "../CascadingMenuList";
import { stateChangeTypes } from "../stateChangeTypes";
import { CascadingMenuAction } from "./CascadingMenuAction";

function isOrContainsNode(parent: HTMLElement | null, child: HTMLElement) {
  return parent === child || !!parent?.contains?.(child);
}

export function useMouseHandlers(
  props: CascadingMenuListProps,
  isMenuActiveState: [boolean, Dispatch<SetStateAction<boolean>>],
  menuRef: HTMLElement | null,
) {
  const [isMenuActive, setIsMenuActive] = isMenuActiveState;
  const {
    delay,
    refsManager,
    dispatch,
    isNavigatingWithKeyboard,
    setIsNavigatingWithKeyboard,
    data,
    highlightedItemIndex,
    menuId,
    parentElement,
  } = props;
  const scheduledHighlightedIndexChange = useRef<number | null>(null);
  const mouseEnterTimer = useRef<number>();
  const mouseOutTimer = useRef<number>();

  useEffect(
    () =>
      function cleanUpTimeouts() {
        clearTimeout(mouseEnterTimer.current);
        clearTimeout(mouseOutTimer.current);
      },
    [],
  );

  const handleMouseMove = useCallback(
    (highlightedIndex: number) => {
      if (isNavigatingWithKeyboard) {
        setIsNavigatingWithKeyboard(false);
      }

      if (!isMenuActive) {
        setIsMenuActive(true);
      }
      if (scheduledHighlightedIndexChange.current !== highlightedIndex) {
        scheduledHighlightedIndexChange.current = highlightedIndex;
        clearTimeout(mouseEnterTimer.current);
        clearTimeout(mouseOutTimer.current);
        mouseEnterTimer.current = window.setTimeout(() => {
          dispatch({
            type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
            cause: stateChangeTypes.ITEM_MOUSE_ENTER,
            targetId: menuId,
            highlightedItemIndex: highlightedIndex,
          });
        }, delay);
      }
    },
    [
      isNavigatingWithKeyboard,
      isMenuActive,
      setIsNavigatingWithKeyboard,
      setIsMenuActive,
      delay,
      dispatch,
      menuId,
    ],
  );
  const handleMouseOut = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isNavigatingWithKeyboard) {
        setIsNavigatingWithKeyboard(false);
      }
      clearTimeout(mouseOutTimer.current);
      // If mouse leaves from parent menu into other element other than submenu -> close submenu
      const { relatedTarget } = event;
      const subMenuElement =
        typeof highlightedItemIndex === "number"
          ? (refsManager.get(data.childMenus[highlightedItemIndex]) ?? null)
          : null;

      const mouseMovedToSameMenu = isOrContainsNode(
        menuRef,
        relatedTarget as HTMLElement,
      );
      const mouseMovedToParentMenu = isOrContainsNode(
        parentElement ?? null,
        relatedTarget as HTMLElement,
      );

      if (mouseMovedToParentMenu) {
        dispatch({
          type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
          cause: stateChangeTypes.ITEM_MOUSE_MOVE_TO_PARENT,
          targetId: menuId,
          highlightedItemIndex: -1,
        });
      }
      const didMouseMoveOutOfMenu = !(
        mouseMovedToParentMenu ||
        mouseMovedToSameMenu ||
        isOrContainsNode(subMenuElement, relatedTarget as HTMLElement)
      );

      if (didMouseMoveOutOfMenu) {
        scheduledHighlightedIndexChange.current = null;
        if (!isMenuActive) {
          setIsMenuActive(true);
          clearInterval(mouseEnterTimer.current);
          mouseOutTimer.current = window.setTimeout(() => {
            dispatch({
              type: CascadingMenuAction.RESET_MENU,
              cause: stateChangeTypes.MOUSE_OUT_OF_MENUS,
              targetId: menuId,
            });
          }, delay);
        }
      } else if (!mouseMovedToSameMenu) {
        setIsMenuActive(false);
      }
    },
    [
      isNavigatingWithKeyboard,
      refsManager,
      data.childMenus,
      highlightedItemIndex,
      menuRef,
      parentElement,
      setIsNavigatingWithKeyboard,
      dispatch,
      menuId,
      isMenuActive,
      delay,
      setIsMenuActive,
    ],
  );
  return [handleMouseMove, handleMouseOut] as const;
}
