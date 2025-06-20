import { useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { cloneElement } from "react";

import { useOverflowCollectionItems } from "../responsive/useOverflowCollectionItems";
import { useOverflowLayout } from "../responsive/useOverflowLayout";

import { renderTrayTools } from "./internal/renderTrayTools";
import { OverflowPanel } from "./overflow-panel/OverflowPanel";
import tooltrayCss from "./Tooltray.css";
import type { TooltrayProps } from "./TooltrayProps";

export const Tooltray = (props: TooltrayProps) => {
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

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tooltray",
    css: tooltrayCss,
    window: targetWindow,
  });
  const tooltrayId = useIdMemo(idProp);

  const className = clsx(
    "saltTooltray",
    classNameProp,
    `saltTooltray-${orientation}`,
    { "saltTooltray-tooltrayOverflowed": isInsidePanel },
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
      }),
    )
    .reverse();

  const overflowIndicator = collectionHook.data.find(
    (i) => i.isOverflowIndicator,
  );

  // bring them back when we get into overflow
  const tooltrayProps = {
    className,
    "data-collapsed": collapsed,
    "data-collapsible": collapse,
  };

  return (
    <div {...rest} {...tooltrayProps} id={tooltrayId}>
      <div className={clsx("Responsive-inner")} ref={innerContainerRef}>
        {renderTrayTools(
          collectionHook,
          overflowedItems,
          orientation,
          collapsed,
        )}
        {overflowIndicator || collapsed ? (
          <OverflowPanel
            className={clsx("saltToolbarField")}
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
