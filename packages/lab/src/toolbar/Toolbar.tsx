import { useForkRef, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  cloneElement,
  forwardRef,
  type ReactElement,
  useRef,
} from "react";

import {
  isOverflowed,
  useOverflowCollectionItems,
  useOverflowLayout,
} from "../responsive";
import { renderToolbarItems } from "./internal/renderToolbarItems";
import { OverflowPanel } from "./overflow-panel/OverflowPanel";
import { OverflowSeparator } from "./overflow-panel/OverflowSeparator";
import toolbarCss from "./Toolbar.css";
import type { ToolbarProps } from "./ToolbarProps";
import { Tooltray } from "./Tooltray";
import type { TooltrayProps } from "./TooltrayProps";

const classBase = "saltToolbar";

/**
 * The core Toolbar implementation, without the external wrapper provided by Toolbar.js
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  function Toolbar(props, ref) {
    const {
      TooltipComponent,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      children,
      className,
      id: idProp,
      overflowButtonIcon,
      overflowButtonLabel,
      overflowButtonPlacement = "end",
      responsive = true,
      disabled = false,
      orientation = "horizontal",
      ...restProp
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toolbar",
      css: toolbarCss,
      window: targetWindow,
    });

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

    const overflowMenuItems = overflowedItems.reduce<ReactElement[]>(
      (items, item, i, arr) => {
        const { element, id } = item;
        if (element.type === Tooltray) {
          const tooltrayProps = element.props as TooltrayProps;
          const nestedElements = tooltrayProps.children as ReactElement[];
          items.push(
            ...Children.map(nestedElements, (el) =>
              cloneElement(el, {
                "data-is-inside-panel": true,
                key: id,
              }),
            ),
          );
          if (i < arr.length - 1) {
            items.push(<OverflowSeparator key={`separator-${id}`} />);
          }
        } else {
          items.push(
            cloneElement(element, {
              key: id,
              "data-is-inside-panel": true,
            }),
          );
        }
        return items;
      },
      [] as ReactElement[],
    );

    const overflowIndicator = collectionHook.data.find(
      (i) => i.isOverflowIndicator,
    );

    const overflowPanel = overflowIndicator ? (
      <OverflowPanel
        className={clsx("saltToolbarField")}
        data-index={collectionHook.data.length}
        data-overflow-indicator
        data-priority={1}
        id={overflowIndicator.id}
        triggerButtonIcon={overflowButtonIcon}
        triggerButtonLabel={overflowButtonLabel}
      >
        {overflowMenuItems}
      </OverflowPanel>
    ) : null;

    //TODO when we drive this from the overflowItems, the overflowIndicator will
    // be an overflowItem
    return (
      <div
        aria-label={ariaLabel}
        // Using `classnames` to join string together. User may want to provide
        // custom ids (e.g. id from counter label), so the element is labelled by
        // multiple items
        aria-labelledby={clsx(toolbarId, ariaLabelledBy)}
        aria-orientation={orientation}
        className={clsx(classBase, className, {
          [`${classBase}-disabled`]: disabled,
          // TODO whats this for ?
          [`${classBase}-nonResponsive`]: !responsive,
        })}
        id={toolbarId}
        ref={setContainerRef}
        role="toolbar"
        {...restProp}
      >
        <div
          className="Responsive-inner"
          ref={innerContainerRef}
          data-collapsing={collectionHook.data.some((item) => item.collapsing)}
        >
          {overflowButtonPlacement === "start" && overflowPanel}
          {renderToolbarItems(collectionHook, overflowedItems, orientation)}
          {overflowButtonPlacement === "end" && overflowPanel}
        </div>
      </div>
    );
  },
);
