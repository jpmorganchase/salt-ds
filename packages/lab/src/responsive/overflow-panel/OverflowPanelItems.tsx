/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
  ReactElement,
} from "react";
import classnames from "classnames";
import { Button, useIsomorphicLayoutEffect } from "@brandname/core";

import { Popper } from "../../popper";
import { PanelItemRendererProps } from "./PanelItemRendererProps";
import OverflowPanelItem from "./OverflowPanelItem";
import { OverflowPanelItemProps } from "./OverflowPanelProps";
import {
  evaluateMenuOffset,
  evaluateMenuPlacement,
  getMaxHeight,
  getHeight,
  LayoutProps,
} from "./menuPositioning";
import { Tooltray } from "../../toolbar";

type popperState = {
  modifiers: {
    offset: any;
    flip: any;
    preventOverflow: any;
    hide: any;
  };
  placement: any;
};

const OverflowPanelItems = forwardRef<HTMLDivElement, OverflowPanelItemProps>(
  function OverflowPanelItems(props, ref) {
    const {
      className,
      minWidth,
      onKeyDown,
      onItemClick,
      refsManager,
      closeMenu: closeMenuProp,
      rowHeight: rowHeightProp,
      isNavigatingWithKeyboard,
      tooltipEnterDelay,
      tooltipLeaveDelay,
      height: heightProp,
      highlightedItemIndex = 0,
      menuItems,
      menuTriggerEl,
      parentElement,
      getBoundingClientRect,
      getScreenBounds,
      rootPlacementOffset,
    } = props;

    // from stackable, based on density
    const defaultRowHeight = 36;
    const spacing = 16;

    const [popperState, setPopperState] = useState<popperState>({
      modifiers: {
        offset: {
          offset: 0,
        },
        flip: {
          enabled: false,
        },
        preventOverflow: {
          boundariesElement: "viewport",
        },
        hide: { enabled: true },
      },
      placement: "left-end",
    });

    const isMenuActiveState = useState(true);
    const [isMenuActive, setIsMenuActive] = isMenuActiveState;
    const [menuRef, setInternalMenuRef] = useState<HTMLElement | null>(null);
    const setMenuRef = useCallback(
      (node) => {
        setInternalMenuRef(node);
        refsManager.set("", node);
      },
      [refsManager]
    );

    useEffect(() => {
      if (menuRef && menuRef!.focus) {
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
      } else {
        return undefined;
      }
    }, [menuRef, rootPlacementOffset]);

    const onFocusHandler = useCallback(() => {
      setIsMenuActive(true);
    }, [setIsMenuActive]);

    const rowHeight = rowHeightProp != null ? rowHeightProp : defaultRowHeight;
    const maxHeight = getMaxHeight(heightProp, spacing, getScreenBounds);
    const calculatedMenuHeight = rowHeight * menuItems!.length;
    const menuHeight = getHeight(heightProp, calculatedMenuHeight, maxHeight);

    const layoutProps: LayoutProps = useMemo(
      () => ({
        parentElement: props.parentElement,
        rootPlacement: props.rootPlacement,
      }),
      [props.parentElement, props.rootPlacement]
    );

    useIsomorphicLayoutEffect(() => {
      setPopperState(({ modifiers }) => ({
        modifiers: {
          ...modifiers,
          offset: {
            offset: evaluateMenuOffset({
              props: layoutProps,
              getBoundingClientRect,
              rootPlacementOffset,
            }),
          },
        },
        placement: evaluateMenuPlacement({
          props: layoutProps,
          menuHeight,
          minWidth,
          getBoundingClientRect,
          getScreenBounds,
        }),
      }));
    }, [
      getBoundingClientRect,
      getScreenBounds,
      rootPlacementOffset,
      layoutProps,
      rowHeight,
      menuHeight,
    ]);

    const closeMenu = () => {
      if (!isNavigatingWithKeyboard) {
        closeMenuProp();
        if (menuTriggerEl) {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement) {
            activeElement.blur();
          }
          menuTriggerEl.focus();
        }
      }
    };

    const getInstantItems = (items: any) =>
      items[1] && items[1].length ? items[1] : items[1].props.children;

    const renderTooltrayOverflow = (
      items: React.ReactNode,
      collapsible: string,
      padEnd: string,
      tooltrayIndex: number
    ) => {
      if (items === undefined) return null;
      const collapsedItems =
        collapsible === "instant" ? getInstantItems(items) : items;
      const trayItems = collapsedItems.length
        ? collapsedItems
        : [collapsedItems];
      const isButtonTray = trayItems.every((item: any) => item.type === Button);
      return (
        <div
          className={classnames(
            "tray",
            isButtonTray ? "buttontray" : "tooltray",
            {
              padEnd: !!padEnd,
            }
          )}
          key={tooltrayIndex}
        >
          {trayItems.map((item: ReactElement, index: number) => {
            const isInteracted = highlightedItemIndex === index;
            const panelItemProps: PanelItemRendererProps = {
              // onItemClick,
              onKeyDown,
              tooltipEnterDelay,
              tooltipLeaveDelay,
              isNavigatingWithKeyboard: isNavigatingWithKeyboard ?? false,
              closeMenu,
              blurSelected: !isMenuActive && isInteracted,
              isInteracted,
              sourceItem: item,
              index,
            };
            return <OverflowPanelItem key={index} {...panelItemProps} />;
          })}
        </div>
      );
    };

    const menuItemsCount = menuItems.reduce((count, item) => {
      if (item.type === Tooltray) {
        // eslint-disable-next-line no-param-reassign
        count = count + item.props.children.length;
      } else {
        // eslint-disable-next-line no-param-reassign
        count++;
      }
      return count;
    }, 0);

    return (
      <Popper
        anchorEl={parentElement}
        // modifiers={popperState.modifiers}
        onFocus={onFocusHandler}
        open
        placement={popperState.placement}
        // ref={ref}
        role={undefined}
      >
        <div
          aria-label={`Overflow menu with ${menuItemsCount} items`}
          className={className}
          id="overflowPanelContainer"
          ref={setMenuRef}
          role="group"
        >
          {menuItems.map((menuItem, index) => {
            const isInteracted = highlightedItemIndex === index;
            // const hasToolTip = !!menuItem.tooltip;
            const panelItemProps = {
              onItemClick,
              onKeyDown,
              tooltipEnterDelay,
              tooltipLeaveDelay,
              isNavigatingWithKeyboard,
              closeMenu,
              blurSelected: !isMenuActive && isInteracted,
              isInteracted,
              sourceItem: menuItem,
              index,
            };
            switch (menuItem.type) {
              case Tooltray:
                return renderTooltrayOverflow(
                  menuItem.props.children,
                  menuItem.props["data-collapsible"],
                  menuItem.props["data-pad-end"],
                  index
                );
              default:
                return <OverflowPanelItem key={index} {...panelItemProps} />;
            }
          })}
        </div>
      </Popper>
    );
  }
);

export default OverflowPanelItems;
