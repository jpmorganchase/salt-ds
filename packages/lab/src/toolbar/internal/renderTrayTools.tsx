import { FormField } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import React, { ReactElement } from "react";
import {
  extractResponsiveProps,
  isResponsiveAttribute,
  ManagedItem,
} from "../../responsive";
import { OrientationShape } from "../ToolbarProps";

const fieldProps = {
  fullWidth: false,
};

export const renderTrayTools = (
  items: ReactElement[],
  isInsidePanel: boolean,
  overflowedItems: ManagedItem[],
  orientation: OrientationShape
) => {
  let index = -1;

  return items.map((tool) => {
    index += 1;
    const className = classnames(
      "tooltray-item",
      tool.props.className,
      "uitkEmphasisLow"
    );
    if (!React.isValidElement(tool)) return null;
    const overflowed =
      overflowedItems.findIndex((item) => item.index === index) === -1
        ? undefined
        : true;

    const toolbarItemProps = {
      "data-is-inside-panel": isInsidePanel,
      className,
      "data-index": index,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "data-priority": tool.props["data-priority"] ?? 2,
      "data-overflowed": overflowed,
      orientation,
    };
    if (tool.type === FormField) {
      return React.cloneElement(tool, toolbarItemProps);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (Object.keys(tool.props).some(isResponsiveAttribute)) {
        const [toolbarProps, props] = extractResponsiveProps(tool.props);
        return (
          <FormField
            {...toolbarProps}
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
            {React.cloneElement(tool, { ...props })}
          </FormField>
        );
      } else {
        return (
          <FormField
            {...fieldProps}
            className={className}
            data-index={index}
            data-overflowed={overflowed}
            data-priority={2}
            data-is-inside-panel={isInsidePanel}
            key={index}
            data-orientation={orientation}
          >
            {React.cloneElement(tool)}
          </FormField>
        );
      }
    }
  });
};
