import { useForkRef } from "@jpmorganchase/uitk-core";
import React, {
  cloneElement,
  forwardRef,
  ReactChild,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ownerWindow, useEventCallback } from "../../utils";
import {
  defaultGetBoundingClientRect,
  defaultGetScreenBounds,
} from "./menuPositioning";
import OverflowPanelItems from "./OverflowPanelItems";
import { MenuState, OverflowPanelProps } from "./OverflowPanelProps";
import useClickAway from "./useClickAway";
import useMenuTriggerHandlers from "./useMenuTriggerHandlers";
import useRefsManager from "./useRefsManager";

import "./OverflowPanel.css";

const noop = () => undefined;

const OverflowPanel = forwardRef<HTMLDivElement, OverflowPanelProps>(
  function OverflowPanel(props, ref) {
    const {
      children,
      menuItems,
      onClose,
      onItemClick,
      onOpen,
      minWidth = 200,
      delay = 300,
      onKeyDown: handleKeyDown,
      rowHeight,
      tooltipEnterDelay = 1500,
      tooltipLeaveDelay = 0,
      height,
      rootPlacement,
      rootPlacementOffset,
      open: openProp,
      getBoundingClientRect = defaultGetBoundingClientRect,
      getScreenBounds = defaultGetScreenBounds,
      disableMouseOutInteractions,
      disableClickAway,
    } = props;

    const refsManager = useRefsManager();
    const childrenRef = useRef(undefined);

    const [isNavigatingWithKeyboard, setIsNavigatingWithKeyboard] =
      useState(false);

    const [menuState, setMenuState] = useState<MenuState | null>(null);

    const openMenu = useCallback(() => {
      setMenuState({ highlightedItemIndex: null, flipped: false });
      onOpen && onOpen();
    }, [onOpen]);
    const closeMenu = useCallback(() => {
      setMenuState(null);
      onClose && onClose();
    }, [onClose]);

    // Controlled opening/closing of the menu
    const openCloseMenu = useCallback(
      (open) => {
        if (open) {
          openMenu();
        } else {
          closeMenu();
        }
      },
      [closeMenu, openMenu]
    );
    // do not re-render every time if prop does not change
    useEffect(() => {
      if (openProp !== undefined && openProp !== !!menuState) {
        openCloseMenu(openProp);
      }
    });

    const menuRef = disableClickAway ? [] : refsManager.values();

    useClickAway(
      menuRef,
      document,
      () => {
        closeMenu();
      },

      () => {
        setIsNavigatingWithKeyboard(false);
      }
    );

    const handleResize: any = useEventCallback(() => {
      if (menuState) {
        closeMenu();
      }
    });

    useEffect(() => {
      const win = ownerWindow(childrenRef.current);
      win.addEventListener("resize", handleResize);
      return () => {
        win.removeEventListener("resize", handleResize);
      };
    }, [handleResize]);

    // close the menu on item click via mouse
    const onItemClickCallback = useCallback(
      (sourceItem, event) => {
        if (onItemClick) {
          onItemClick(sourceItem, event);
        }
      },
      [onItemClick]
    );

    // Set up event handlers on menu trigger if passed
    const setMenuTriggerRef = useCallback((node) => {
      childrenRef.current = node;
    }, []);
    const handleRef = useForkRef(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      children ? children.ref : noop,
      setMenuTriggerRef
    );

    const [onMenuTriggerClick, handleOnKeydown] = useMenuTriggerHandlers({
      children,
      closeMenu,
      setIsNavigatingWithKeyboard,
      openMenu,
      openCloseMenu,
      handleKeyDown,
      menuState,
    });

    // WHy not code this directly in the Button in OverflowMenu ?
    const cloneMenuChildren = (cloneChildren: ReactChild) => {
      if (React.isValidElement(cloneChildren)) {
        const childrenProps = {
          ...cloneChildren.props,
        };

        if (openProp === undefined) {
          childrenProps.onClick = onMenuTriggerClick;
          childrenProps.onKeyDown = handleOnKeydown;
        }

        return cloneElement(cloneChildren, {
          ref: handleRef,
          ...childrenProps,
        });
      }
      return null;
    };

    const clonedChildren = React.isValidElement(children)
      ? cloneMenuChildren(children)
      : null;

    const commonMenuProps = {
      delay,
      minWidth,
      onItemClick: onItemClickCallback,
      onKeyDown: handleOnKeydown,
      closeMenu,
      isNavigatingWithKeyboard,
      setIsNavigatingWithKeyboard,
      tooltipEnterDelay,
      tooltipLeaveDelay,
      rootPlacement,
      rootPlacementOffset,
      getBoundingClientRect,
      getScreenBounds,
      disableMouseOutInteractions,
    };

    useEffect(() => {
      if (!openProp) {
        setIsNavigatingWithKeyboard(false);
      }
    }, [openProp, rootPlacementOffset]);

    return (
      <>
        {clonedChildren || null}
        {menuState && (
          <OverflowPanelItems
            {...commonMenuProps}
            className="uitkOverflowPanel"
            flipped={menuState.flipped}
            height={height}
            highlightedItemIndex={menuState.highlightedItemIndex || undefined}
            menuItems={menuItems}
            menuTriggerEl={childrenRef.current}
            parentElement={childrenRef.current}
            ref={ref}
            refsManager={refsManager}
            rowHeight={rowHeight}
          />
        )}
      </>
    );
  }
);

export default OverflowPanel;
