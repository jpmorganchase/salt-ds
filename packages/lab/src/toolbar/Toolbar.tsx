import { useForkRef, useIdMemo } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { DropdownPanel } from "../dropdown";

import useKeyboardNavigation from "./internal/useKeyboardNavigationDEPRECATED";
import { renderToolbarItems } from "./internal/renderToolbarItems";
import { ToolbarProps } from "./ToolbarProps";
import Tooltray from "./Tooltray";
import { ToolbarContext, ToolbarContextProps } from "./ToolbarContext";
import {
  isCollapsedOrCollapsing,
  isOverflowed,
  useOverflowCollectionItems,
  useOverflowLayout,
} from "../responsive";

import "./Toolbar.css";

const classBase = "uitkToolbar";

/**
 * The core Toolbar implementation, without the external wrapper provided by Toolbar.js
 */
const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  props,
  ref
) {
  const {
    OverflowPanelProps,
    OverflowButtonProps,
    TooltipComponent,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    children,
    className,
    emphasis = "high",
    id: idProp,
    overflowButtonIcon,
    overflowButtonLabel,
    onHiddenItemsChange,
    responsive = true,
    disabled = false,
    orientation = "horizontal",
    overflowButtonRef: overflowButtonRefProp = null,
    wrapChildrenWithFormFields = true,
    ...restProp
  } = props;

  const toolbarId = useIdMemo(idProp);
  const containerRef = useRef<HTMLDivElement>(null);

  const setContainerRef = useForkRef(ref, containerRef);

  const collectionHook = useOverflowCollectionItems({
    children,
    id: toolbarId,
    orientation,
    label: "Toolbar",
  });

  const [innerContainerRef] = useOverflowLayout({
    collectionHook,
    id: toolbarId,
    orientation,
    label: "Toolbar",
  });

  const overflowedItems = collectionHook.data.filter(isOverflowed);
  const collapseItems = collectionHook.data.filter(isCollapsedOrCollapsing);

  useEffect(() => {
    onHiddenItemsChange && onHiddenItemsChange(overflowedItems);
  }, [overflowedItems, onHiddenItemsChange]);

  const isCollapsed = useCallback((id: string) => {
    return false;
  }, []);

  const isInOverflowPanel = useCallback((id: string) => {
    return false;
  }, []);

  const toolbarContext: ToolbarContextProps = useMemo(
    () => ({
      orientation,
      disabled,
      isCollapsed,
      isInOverflowPanel,
    }),
    [orientation, disabled]
  );

  // const alignedItems = tools.filter(
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   (item: any) => item.props["data-pad-end"] || item.props["data-pad-start"]
  // );

  const overflowMenuItems = overflowedItems.map(
    (i) => collectionHook.data[i.index].element
  );

  const insidePanelItems = useMemo(
    () =>
      overflowedItems.map((i, index) => ({
        index: i.index,
        isTooltray: overflowMenuItems[index]?.type === Tooltray,
      })),
    [overflowMenuItems, overflowedItems]
  );

  const focusableItems = useRef<HTMLElement[]>([]);
  const visibleItems = useRef<HTMLElement[]>([]);

  const getFocusableItems = (items: HTMLElement[]): HTMLElement[] =>
    items.reduce((focusable: HTMLElement[], item: HTMLElement) => {
      const focusTarget: HTMLElement | null =
        item.querySelector('[tabindex = "0"]') || item.querySelector("input");
      if (focusTarget) {
        focusable.push(focusTarget);
      }
      return focusable;
    }, []);

  const setToolItems = useCallback(() => {
    const container = innerContainerRef.current;
    if (container) {
      focusableItems.current = getFocusableItems(
        Array.from(container.querySelectorAll(".toolbar-item, .tooltray-item"))
      );

      visibleItems.current = Array.from(container.children).reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (visible: HTMLElement[], child: any, index): HTMLElement[] => {
          if (!insidePanelItems.some((item) => item.index === index)) {
            // spread if it is a tooltray
            const trayItems: HTMLElement[] = Array.from(
              child.querySelectorAll('[tabindex = "0"], input')
            );
            if (trayItems.length > 0) {
              trayItems.map((item: HTMLElement) => visible.push(item));
            } else {
              if (child.getAttribute("tabindex") === "0") {
                visible.push(child);
              }
            }
          }
          return visible;
        },
        []
      );
    }
  }, [innerContainerRef, insidePanelItems]);

  useEffect(() => {
    setToolItems();
  }, [setToolItems, insidePanelItems]);

  const handleKeyDown = useKeyboardNavigation(visibleItems);

  const overflowIndicator = collectionHook.data.find(
    (i) => i.isOverflowIndicator
  );

  //TODO when we drive this from the overflowItems, the overflowIndicator will
  // be an overflowItem
  return (
    <ToolbarContext.Provider value={toolbarContext}>
      <div
        aria-label={ariaLabel}
        // Using `classnames` to join string together. User may want to provide
        // custom ids (e.g. id from counter label), so the element is labelled by
        // multiple items
        aria-labelledby={cx(toolbarId, ariaLabelledBy)}
        aria-orientation={orientation}
        className={cx(classBase, className, {
          [`${classBase}-disabled`]: disabled,
          [`${classBase}-nonResponsive`]: !responsive,
          uitkEmphasisLow: emphasis === "low",
          uitkEmphasisHigh: emphasis === "high",
        })}
        id={toolbarId}
        ref={setContainerRef}
        role="toolbar"
        {...restProp}
      >
        <div
          className="Responsive-inner"
          ref={innerContainerRef}
          data-collapsing={
            collapseItems.findIndex((item) => item.collapsing) !== -1
          }
        >
          {renderToolbarItems(
            collectionHook,
            handleKeyDown,
            overflowedItems,
            collapseItems,
            orientation,
            wrapChildrenWithFormFields
          )}
          {overflowIndicator ? (
            <DropdownPanel
              className={cx("uitkToolbarField", "toolbar-item")}
              data-index={collectionHook.data.length}
              data-overflow-indicator
              data-priority={1}
              id={overflowIndicator.id}
              triggerButtonIcon={overflowButtonIcon}
              triggerButtonLabel={overflowButtonLabel}
              // onChange={handleChange}
            >
              {overflowMenuItems}
            </DropdownPanel>
          ) : null}
        </div>
      </div>
    </ToolbarContext.Provider>
  );
});

export default Toolbar;
