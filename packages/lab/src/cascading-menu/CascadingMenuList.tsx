import {
  type UseFloatingUIProps,
  useFloatingUI,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { List, type ListProps } from "../list-deprecated";
import { Portal } from "../portal";
import { useWindow as usePortalWindow } from "../window";
import { DefaultMenuItem, type MenuItemProps } from "./CascadingMenuItem";
import cascadingMenuListCss from "./CascadingMenuList.css";
import { CascadingMenuAction } from "./internal/CascadingMenuAction";
import { getKeyDownHandlers } from "./internal/keydownHandlers";
import {
  getHeight,
  getMaxHeight,
  type screenBounds,
} from "./internal/menuPositioning";
import { hasIcon, hasSubMenu, type menuState } from "./internal/stateUtils";
import { useMouseHandlers } from "./internal/useMouseHandlers";
import type { refsManager } from "./internal/useRefsManager";
import { stateChangeTypes } from "./stateChangeTypes";

export interface CascadingMenuListProps {
  className?: string;
  data: menuState;
  delay?: number;
  disableMouseOutInteractions?: boolean;
  // TODO any
  dispatch: (action: any) => void;
  getBoundingClientRect?: (element: HTMLElement) => DOMRect;
  getScreenBounds?: () => screenBounds;
  height?: number;
  highlightedItemIndex: number | null;
  isChildMenuOpen: boolean;
  itemToString: MenuItemProps["itemToString"];
  isNavigatingWithKeyboard: boolean;
  isRoot: boolean;
  maxWidth?: ListProps["maxWidth"];
  menuId: string;
  menuTriggerRef: HTMLElement | null;
  minWidth?: ListProps["minWidth"];
  onItemClick?: MenuItemProps["onItemClick"];
  parentElement?: HTMLElement | null;
  refsManager: refsManager;
  rootPlacement?: UseFloatingUIProps["placement"];
  rootPlacementOffset?: string;
  rowHeight?: number;
  setIsNavigatingWithKeyboard: (value: boolean) => void;
  tooltipEnterDelay: number;
  tooltipLeaveDelay: number;
}

export const CascadingMenuList = forwardRef<
  HTMLDivElement,
  CascadingMenuListProps
>(function CascadingMenuList(props, ref) {
  const {
    className,
    maxWidth,
    minWidth,
    itemToString,
    onItemClick,
    refsManager,
    dispatch,
    rowHeight: rowHeightProp,
    isNavigatingWithKeyboard,
    data,
    tooltipEnterDelay,
    tooltipLeaveDelay,
    height: heightProp,
    isChildMenuOpen,
    isRoot,
    highlightedItemIndex,
    menuId,
    parentElement = null,
    getScreenBounds,
    disableMouseOutInteractions,
    rootPlacementOffset,
    rootPlacement = "bottom-start",
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-cascading-menu-list",
    css: cascadingMenuListCss,
    window: targetWindow,
  });

  const baseClass = "saltCascadingMenuList";

  const [menuRef, setInternalMenuRef] = useState<HTMLElement | null>(null);
  const setMenuRef = useCallback(
    (node: HTMLElement) => {
      refsManager.set(menuId, node);
    },
    [refsManager, menuId],
  );

  // TODO removed useCharacteristic here
  const sizeStackable = 36;
  const defaultRowHeight = sizeStackable;

  // TODO removed useCharacteristic here
  const spacing = 8;

  const isMenuActiveState = useState(true);
  const [isMenuActive, setIsMenuActive] = isMenuActiveState;
  const listRef = useForkRef<HTMLElement>(ref, setInternalMenuRef);
  const handleRef = useForkRef(setMenuRef, listRef);

  useEffect(() => {
    if (menuRef?.focus) {
      // timeout prevents scrolling issue by waiting a split second
      // and menu should be correctly positioned by then and
      // focusing popper content offscreen will not scroll page
      // it would be better to maybe use popper onUpdate callback
      // or some kind of polling mechanism to confirm placement is
      // correct before focus call
      const id = setTimeout(() => {
        menuRef.focus();
      });
      return () => {
        clearTimeout(id);
      };
    }
  }, [menuRef, rootPlacementOffset]);

  const handleKeyDown = getKeyDownHandlers(props, setIsMenuActive);

  const onFocusHandler = useCallback(() => {
    setIsMenuActive(true);
    // When navigating via keyboard on open highlight first time in the list
    if (isNavigatingWithKeyboard) {
      if (!highlightedItemIndex) {
        dispatch({
          type: CascadingMenuAction.SET_CURRENT_INTERACTED_ITEM,
          cause: stateChangeTypes.KEYBOARD_NAV_AUTO_FOCUS,
          targetId: menuId,
          highlightedItemIndex: 0,
        });
      }
    }
  }, [
    setIsMenuActive,
    isNavigatingWithKeyboard,
    highlightedItemIndex,
    dispatch,
    menuId,
  ]);

  const [handleMouseMove, handleMouseOut] = useMouseHandlers(
    props,
    isMenuActiveState,
    menuRef,
  );

  const hasEndAdornment = useMemo(
    () => data.menuItems.some(hasSubMenu),
    [data],
  );
  const hasStartAdornment = useMemo(() => data.menuItems.some(hasIcon), [data]);
  const rowHeight = rowHeightProp != null ? rowHeightProp : defaultRowHeight;
  const maxHeight = getMaxHeight(heightProp, spacing, getScreenBounds);
  const calculatedMenuHeight = rowHeight * data.menuItems.length;
  const menuHeight = getHeight(heightProp, calculatedMenuHeight, maxHeight);
  const hasScrollbar = menuHeight >= maxHeight;

  // menu container size is 2px larger than the list to include the border
  const menuContainerHeight = menuHeight + 2;
  const Window = usePortalWindow();
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: isRoot ? rootPlacement : "right-start",
  });
  useIsomorphicLayoutEffect(() => {
    if (parentElement) {
      reference(
        isRoot
          ? parentElement
          : parentElement.querySelector(
              `#${
                parentElement.getAttribute("aria-activedescendant") as string
              }`,
            ),
      );
    }
  }, [reference, isRoot, parentElement]);

  if (parentElement === null) {
    return null;
  }

  return (
    <Portal>
      <Window
        className={`${baseClass}-popper`}
        id={menuId}
        style={{
          top: y ?? 0,
          left: x ?? 0,
          position: strategy,
        }}
        ref={floating}
      >
        <List
          className={clsx(baseClass, className)}
          height={menuContainerHeight}
          highlightedIndex={
            highlightedItemIndex === null ? -1 : highlightedItemIndex
          }
          id={menuId}
          itemHeight={rowHeight}
          itemToString={itemToString}
          key={menuId}
          listRef={handleRef}
          maxWidth={maxWidth}
          minWidth={minWidth}
          onFocus={onFocusHandler}
          onKeyDown={handleKeyDown}
          onMouseOut={disableMouseOutInteractions ? undefined : handleMouseOut}
          role="menu"
          width="auto"
        >
          {data.menuItems.map((menuItem, idx) => {
            const isInteracted = highlightedItemIndex === idx;
            return (
              <DefaultMenuItem
                blurSelected={!isMenuActive && isInteracted}
                hasEndAdornment={hasEndAdornment}
                hasScrollbar={hasScrollbar}
                hasStartAdornment={hasStartAdornment}
                hasSubMenu={hasSubMenu(menuItem)}
                isChildMenuOpen={isChildMenuOpen}
                isInteracted={isInteracted}
                isNavigatingWithKeyboard={isNavigatingWithKeyboard}
                itemToString={itemToString}
                key={menuItem.id}
                onItemClick={onItemClick}
                onMouseMove={() => handleMouseMove(idx)}
                sourceItem={menuItem}
                tooltipEnterDelay={tooltipEnterDelay}
                tooltipLeaveDelay={tooltipLeaveDelay}
              />
            );
          })}
        </List>
      </Window>
    </Portal>
  );
});
