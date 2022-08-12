/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { limitShift, shift } from "@floating-ui/react-dom-interactions";
import {
  Button,
  Portal,
  useFloatingUI,
  useForkRef,
  useIsomorphicLayoutEffect,
  useWindow,
} from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import Tooltray from "../../toolbar/Tooltray";
import OverflowPanelItem from "./OverflowPanelItem";
import { OverflowPanelItemProps } from "./OverflowPanelProps";
import { PanelItemRendererProps } from "./PanelItemRendererProps";

const OverflowPanelItems = forwardRef<HTMLDivElement, OverflowPanelItemProps>(
  function OverflowPanelItems(props, ref) {
    const {
      className,
      onKeyDown,
      onItemClick,
      refsManager,
      closeMenu: closeMenuProp,
      isNavigatingWithKeyboard,
      tooltipEnterDelay,
      tooltipLeaveDelay,
      highlightedItemIndex = 0,
      menuItems,
      menuTriggerEl,
      parentElement,
      rootPlacementOffset,
    } = props;

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

    const { reference, floating, x, y, strategy } = useFloatingUI({
      placement: "bottom-end",
      middleware: [
        shift({
          limiter: limitShift(),
        }),
      ],
    });
    const handleRef = useForkRef<HTMLDivElement>(floating, ref);

    useIsomorphicLayoutEffect(() => {
      if (parentElement) {
        reference(parentElement);
      }
    }, [reference, parentElement]);

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
        count = count + item.props.children.length;
      } else {
        count++;
      }
      return count;
    }, 0);

    const Window = useWindow();

    return (
      <Portal>
        <Window
          onFocus={onFocusHandler}
          ref={handleRef}
          style={{
            top: y ?? "",
            left: x ?? "",
            position: strategy,
          }}
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
        </Window>
      </Portal>
    );
  }
);

export default OverflowPanelItems;
