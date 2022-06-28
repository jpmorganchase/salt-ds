import { FormField, useForkRef, useId } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { OverflowMenu } from "../responsive/overflow-menu";
import {
  isCollapsedOrCollapsing,
  isOverflowed,
} from "../responsive/overflowUtils";
import { useOverflowLayout } from "../responsive/useOverflowLayout";
import { renderTools } from "./internal/renderTools";
import ToolbarMetaContext, { ToolbarMeta } from "./internal/ToolbarMetaContext";
import useKeyboardNavigation from "./internal/useKeyboardNavigation";
import { ToolbarProps } from "./ToolbarProps";
import Tooltray from "./Tooltray";

import "./Toolbar.css";

const classBase = "uitkToolbar";

type actionCallbacks = {
  [key: string]: (() => void) | null;
};

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

  const toolbarId = useId(idProp);
  const containerRef = useRef<HTMLDivElement>(null);

  const { current: actionCallbacksById } = useRef<actionCallbacks>({});
  const setContainerRef = useForkRef(ref, containerRef);
  const overflowButtonRef = useRef<HTMLDivElement>(null);
  const setOverflowButtonRef = useForkRef(
    overflowButtonRefProp,
    overflowButtonRef
  );

  const tools = React.Children.toArray(children) as ReactElement[];
  // const childrenWithIds = ensureChildrenHaveIds(children, "toolbar");

  // const buttonDescriptors = useToolbarButtonDescriptors(
  //   childrenWithIds,
  //   disabled /* isToolbarDisabled */
  // );

  const [innerContainerRef, managedItems] = useOverflowLayout(
    orientation /*, buttonDescriptors */,
    "Toolbar"
  );

  const overflowedItems = managedItems.filter(isOverflowed);
  const collapseItems = managedItems.filter(isCollapsedOrCollapsing);

  useEffect(() => {
    onHiddenItemsChange && onHiddenItemsChange(overflowedItems);
  }, [overflowedItems, onHiddenItemsChange]);

  const setClickCallback = useCallback(
    (callbackId, callback) => {
      actionCallbacksById[callbackId] = callback;
    },
    [actionCallbacksById]
  );

  const unsetClickCallback = useCallback(
    (callbackId) => {
      actionCallbacksById[callbackId] = null;
    },
    [actionCallbacksById]
  );

  const toolbarMeta: ToolbarMeta = useMemo(
    () => ({
      orientation,
      disabled,
      TooltipComponent,
      setClickCallback,
      unsetClickCallback,
    }),
    [
      orientation,
      disabled,
      TooltipComponent,
      setClickCallback,
      unsetClickCallback,
    ]
  );

  const handleOverflowItemClick = useCallback(
    (itemId) => {
      const actionCallback = actionCallbacksById[itemId];
      if (typeof actionCallback === "function") {
        actionCallback();
      }
    },
    [actionCallbacksById]
  );
  const alignedItems = tools.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => item.props["data-pad-end"] || item.props["data-pad-start"]
  );

  const overflowMenuItems = overflowedItems.map((i) => tools[i.index]);
  const alignedItemsInBar = alignedItems.every((i) =>
    overflowMenuItems.includes(i)
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

  console.log({ collapseItems });

  // const densityClass: DensityClassKey = classes?.[`${density}Density`];
  return (
    <ToolbarMetaContext.Provider value={toolbarMeta}>
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
        })}
        id={toolbarId}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          {renderTools(
            handleKeyDown,
            tools,
            overflowedItems,
            collapseItems,
            orientation,
            toolbarId,
            wrapChildrenWithFormFields
          )}
          {overflowedItems.length > 0 ? (
            <FormField
              ActivationIndicatorComponent={() => null}
              className={cx(
                "uitkToolbarField",
                "toolbar-item",
                "uitkEmphasisLow",
                {
                  "uitkToolbarField-start":
                    OverflowButtonProps?.align === "start",
                }
              )}
              data-index={tools.length}
              data-overflow-indicator
              data-pad-start={alignedItemsInBar}
              data-orientation={orientation}
              data-priority={1}
              fullWidth={false}
            >
              <OverflowMenu
                OverflowPanelProps={OverflowPanelProps}
                OverflowButtonProps={OverflowButtonProps}
                aria-haspopup
                aria-label="toolbar overflow"
                // className="Toolbar-overflowMenu"
                key="overflow"
                onItemClick={handleOverflowItemClick}
                onKeyDown={handleKeyDown}
                orientation={orientation}
                overflowButtonIcon={overflowButtonIcon}
                overflowButtonLabel={overflowButtonLabel}
                ref={setOverflowButtonRef}
                menuItems={overflowMenuItems}
              />
            </FormField>
          ) : null}
        </div>
      </div>
    </ToolbarMetaContext.Provider>
  );
});

export default Toolbar;
