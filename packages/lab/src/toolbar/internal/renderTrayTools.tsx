import { FormField } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import React from "react";
import {
  OverflowItem,
  OverflowCollectionHookResult,
} from "../../responsive/overflowTypes";
import {
  extractResponsiveProps,
  isResponsiveAttribute,
} from "../../responsive/utils";
import { OrientationShape } from "../ToolbarProps";
import { ToolbarButton } from "../ToolbarButton";

const fieldProps = {
  fullWidth: false,
};

export const renderTrayTools = (
  collectionHook: OverflowCollectionHookResult,
  isInsidePanel: boolean,
  overflowedItems: OverflowItem[],
  orientation: OrientationShape,
  renderOverflow: any,
  collapse?: string | boolean,
  collapsed?: boolean | string
) => {
  let index = -1;

  const children = collectionHook.data.filter(
    (item) => !item.isOverflowIndicator
  );

  const childIsInstantCollapsed = !isInsidePanel && collapsed === true;
  const getInstantChildren = (items: OverflowItem[]) =>
    childIsInstantCollapsed ? renderOverflow(items) : items;

  const items: OverflowItem[] =
    collapse === "instant" ? getInstantChildren(collectionHook.data) : children;

  return items.map((item) => {
    index += 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = item.element.props as any;

    const className = classnames(
      "uitkTooltray-item",
      "uitkEmphasisLow",
      props.className
    );
    const overflowed =
      overflowedItems.findIndex((i) => i.index === index) === -1
        ? undefined
        : true;

    const toolbarItemProps = {
      "data-is-inside-panel": isInsidePanel,
      className,
      "data-index": index,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "data-priority": props["data-priority"] ?? 2,
      "data-overflowed": overflowed,
      id: item.id,
      orientation,
    };
    if (item.element.type === FormField) {
      return React.cloneElement(item.element, {
        ...toolbarItemProps,
        ...fieldProps,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (Object.keys(props).some(isResponsiveAttribute)) {
        const [toolbarProps, restProps] = extractResponsiveProps(props);
        return (
          <FormField
            {...toolbarProps}
            {...toolbarItemProps}
            {...fieldProps}
            className={className}
            data-index={index}
            data-priority={2}
            isInsidePanel={isInsidePanel}
            key={index}
            orientation={orientation}
            withActivationIndicator={false}
          >
            {/* We clone here just to remove the responsive props */}
            {React.cloneElement(item.element, { ...restProps })}
          </FormField>
        );
      } else {
        return (
          <FormField
            {...fieldProps}
            {...toolbarItemProps}
            className={className}
            data-index={index}
            data-overflowed={overflowed}
            data-priority={2}
            data-is-inside-panel={isInsidePanel}
            key={index}
            data-orientation={orientation}
          >
            {React.cloneElement(item.element, {
              id: `tooltray-control-${toolbarItemProps.id}`,
            })}
          </FormField>
        );
      }
    }
  });
};
