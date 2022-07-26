import { useIdMemo } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { DropdownPanel } from "../dropdown";

import useKeyboardNavigation from "./internal/useKeyboardNavigationDEPRECATED";
import { TooltrayProps } from "./TooltrayProps";

import { useOverflowLayout } from "../responsive/useOverflowLayout";
import { useOverflowCollectionItems } from "../responsive/useOverflowCollectionItems";
import { OverflowItem } from "../responsive/overflowTypes";

import { renderTrayTools } from "./internal/renderTrayTools";

import "./Tooltray.css";

const Tooltray: React.FC<TooltrayProps> = (props) => {
  const {
    OverflowButtonProps,
    "aria-label": ariaLabel,
    children,
    className: classNameProp,
    collapse: collapseProp,
    collapsed: collapsedProp,
    disabled = false,
    "data-collapsible": collapse = collapseProp,
    "data-collapsed": collapsed = collapsedProp,
    id: idProp,
    isInsidePanel = false,
    overflowButtonIcon,
    overflowButtonLabel,
    orientation = "horizontal",
    ...rest
  } = props;

  const tooltrayId = useIdMemo(idProp);

  const className = cx(
    "uitkTooltray",
    classNameProp,
    `uitkTooltray-${orientation}`,
    { "uitkTooltray-tooltrayOverflowed": isInsidePanel }
  );

  const collectionHook = useOverflowCollectionItems({
    children,
    id: tooltrayId,
    label: "Tooltray",
    orientation,
  });

  console.log({
    TooltrayCollectionItems: collectionHook.data,
  });

  const [innerContainerRef] = useOverflowLayout({
    collectionHook,
    id: tooltrayId,
    orientation,
    label: "Tooltray",
  });
  const overflowedItems = collectionHook.data.filter((item) => item.overflowed);

  const overflowMenuItems = overflowedItems
    .map((i) => collectionHook.data[i.index].element)
    .reverse();

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

  // TODO a lot of this is repeated in ToolbarBase
  const setToolItems = useCallback(() => {
    const container = innerContainerRef.current;
    if (container) {
      focusableItems.current = Array.from(
        container.querySelectorAll('[tabindex = "0"]')
      );

      visibleItems.current = Array.from(container.children).reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (visible: HTMLElement[], child: any, index): HTMLElement[] => {
          if (!insidePanelItems.some((item) => item.index === index)) {
            // spread if it is a tooltray
            const trayItems: HTMLElement[] = Array.from(
              child.querySelectorAll('[tabindex = "0"]')
            );
            if (trayItems.length > 0) {
              trayItems.map((item: HTMLElement) => visible.push(item));
            } else {
              visible.push(child);
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
  }, [setToolItems]);

  const handleKeyDown = useKeyboardNavigation(visibleItems);
  const overflowIndicator = collectionHook.data.find(
    (i) => i.isOverflowIndicator
  );

  const renderOverflow = (overflowedItems: OverflowItem[]) => (
    <DropdownPanel
      className={cx("uitkToolbarField", "toolbar-item")}
      data-index={collectionHook.data.length}
      data-overflow-indicator
      data-priority={1}
      id={overflowIndicator?.id}
      triggerButtonIcon={overflowButtonIcon}
      triggerButtonLabel={overflowButtonLabel}
      // onChange={handleChange}
    >
      {overflowedItems.map((i) => collectionHook.data[i.index].element)}
    </DropdownPanel>
  );

  // bring them back when we get into overflow
  const tooltrayProps = {
    className,
    "data-collapsed": collapsed,
    "data-collapsible": collapse,
  };

  return (
    <div {...rest} {...tooltrayProps} id={tooltrayId}>
      <div className={cx("Responsive-inner")} ref={innerContainerRef}>
        {renderTrayTools(
          collectionHook,
          isInsidePanel,
          overflowedItems,
          orientation,
          renderOverflow,
          collapse,
          collapsed
        )}
        {overflowIndicator ? renderOverflow(overflowedItems) : null}
      </div>
    </div>
  );
};

export default Tooltray;
