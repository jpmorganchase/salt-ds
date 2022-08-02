import { useIdMemo } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import React, { cloneElement } from "react";
import { OverflowPanel } from "./overflow-panel/OverflowPanel";

import { TooltrayProps } from "./TooltrayProps";

import { useOverflowCollectionItems } from "../responsive/useOverflowCollectionItems";
import { useOverflowLayout } from "../responsive/useOverflowLayout";

import { renderTrayTools } from "./internal/renderTrayTools";

import "./Tooltray.css";

export const Tooltray: React.FC<TooltrayProps> = (props) => {
  const {
    "aria-label": ariaLabel,
    // Tooltray itself doesn't use these alignment props directly,
    // they are read and used by the parent Toolbar
    alignEnd,
    alignStart,
    children,
    className: classNameProp,
    collapse: collapseProp,
    collapsed: collapsedProp,
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

  const [innerContainerRef] = useOverflowLayout({
    collectionHook,
    id: tooltrayId,
    orientation,
    label: "Tooltray",
  });
  const overflowedItems = collapsed
    ? collectionHook.data.filter((item) => !item.isOverflowIndicator)
    : collectionHook.data.filter((item) => item.overflowed);

  const overflowMenuItems = overflowedItems
    .map((i) =>
      cloneElement(collectionHook.data[i.index].element, {
        "data-is-inside-panel": true,
        key: i.index,
      })
    )
    .reverse();

  const overflowIndicator = collectionHook.data.find(
    (i) => i.isOverflowIndicator
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
          overflowedItems,
          orientation,
          collapsed
        )}
        {overflowIndicator || collapsed ? (
          <OverflowPanel
            className={cx("uitkToolbarField")}
            data-index={collectionHook.data.length}
            data-overflow-indicator
            data-priority={1}
            id={overflowIndicator?.id}
            triggerButtonIcon={overflowButtonIcon}
            triggerButtonLabel={overflowButtonLabel}
          >
            {overflowMenuItems}
          </OverflowPanel>
        ) : null}
      </div>
    </div>
  );
};
