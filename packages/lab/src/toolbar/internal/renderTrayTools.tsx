import React, { ReactNode } from "react";
import {
  OverflowCollectionHookResult,
  OverflowItem,
} from "../../responsive/overflowTypes";
import {
  isResponsiveAttribute,
  liftResponsivePropsToFormField,
} from "../../responsive/utils";
import { ToolbarField } from "../toolbar-field/ToolbarField";
import { OrientationShape } from "../ToolbarProps";

type TooltrayItem = {
  "data-priority"?: number | string;
  className: string;
};

export const renderTrayTools = (
  collectionHook: OverflowCollectionHookResult,
  overflowedItems: OverflowItem[],
  orientation: OrientationShape,
  collapsed?: boolean | string
): ReactNode => {
  if (collapsed) {
    return [];
  }

  let index = -1;

  const items = collectionHook.data.filter((item) => !item.isOverflowIndicator);

  return items.map((item) => {
    index += 1;
    const props = item.element.props as TooltrayItem;

    const overflowed =
      overflowedItems.findIndex((i) => i.index === index) === -1
        ? undefined
        : true;

    const toolbarItemProps = {
      "data-index": index,
      "data-priority": props["data-priority"] ?? 2,
      "data-overflowed": overflowed,
      id: item.id,
      orientation,
    };
    if (item.element.type === ToolbarField) {
      return React.cloneElement(item.element, {
        key: index,
        ...toolbarItemProps,
      });
    } else {
      if (Object.keys(props).some(isResponsiveAttribute)) {
        const [toolbarProps, restProps] = liftResponsivePropsToFormField(props);
        return (
          <ToolbarField
            {...toolbarProps}
            {...toolbarItemProps}
            // don't think we need the data-index
            data-index={index}
            data-priority={2}
            key={index}
            data-orientation={orientation}
          >
            {/* We clone here just to remove the responsive props */}
            {React.cloneElement(item.element, { ...restProps })}
          </ToolbarField>
        );
      } else {
        return (
          <ToolbarField
            {...toolbarItemProps}
            data-index={index}
            data-overflowed={overflowed}
            data-priority={2}
            key={index}
            data-orientation={orientation}
          >
            {React.cloneElement(item.element, {
              id: `tooltray-control-${item.id}`,
            })}
          </ToolbarField>
        );
      }
    }
  });
};
