/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FormField, FormFieldProps } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import React, { KeyboardEvent, ReactElement } from "react";
import {
  extractResponsiveProps,
  isResponsiveAttribute,
  ManagedItem,
  orientationType,
} from "../../responsive";
import Tooltray from "../Tooltray";

const fieldProps = {
  fullWidth: false,
  labelPlacement: "left",
};

const NullActivationIndicator = () => null;

export const renderToolbarField = (
  tool: ReactElement,
  toolbarItemProps: Partial<FormFieldProps>,
  independentItemProps: Partial<FormFieldProps>,
  index: number
): JSX.Element => {
  const [responsiveProps, props] = Object.keys(tool.props).some(
    isResponsiveAttribute
  )
    ? extractResponsiveProps(tool.props)
    : [{}, tool.props];

  return (
    <FormField
      ActivationIndicatorComponent={NullActivationIndicator}
      {...responsiveProps}
      {...toolbarItemProps}
      {...fieldProps}
      key={index}
      className="uitkEmphasisLow"
      {...independentItemProps}
    >
      {React.cloneElement(tool, { ...props })}
    </FormField>
  );
};

const getId = (toolbarId: string, tool: ReactElement, index: number) =>
  tool.props.id ?? `${toolbarId}-${index}`;

export const renderTools = (
  handleKeyDown: (evt: KeyboardEvent<HTMLElement>) => void,
  childItems: ReactElement[],
  overflowedItems: ManagedItem[] = [],
  collapseItems: ManagedItem[] = [],
  orientation: orientationType,
  toolbarId: string,
  wrapChildrenWithFormFields = true
): JSX.Element[] => {
  let centerAlign = false;
  let rightAlign = false;

  return childItems.map((childItem: ReactElement<unknown>, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = childItem.props as any;
    // index is a fragile way to link these, we need some kind of id and map.
    // this items should have an ID
    const overflowed =
      overflowedItems.findIndex((item) => item.index === index) === -1
        ? undefined
        : true;
    const collapseItem = collapseItems.find((item) => item.index === index);
    const collapsed = collapseItem?.collapsed || undefined;
    const collapsing = collapseItem?.collapsing || undefined;

    // TODO do we need this check ? If so, this is probably not the place
    // if (!React.isValidElement(childItem)) return null;
    const {
      alignCenter: alignCenterProp,
      alignEnd: alignEndProp,
      alignStart: alignStartProp,
      "data-align-center": alignCenter = alignCenterProp,
      "data-align-end": alignEnd = alignEndProp,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      "data-align-start": alignStart = alignStartProp,
    } = childItem.props as any;

    let dataPadStart = false;
    let dataPadEnd = false;
    if (alignCenter && !centerAlign) {
      centerAlign = true;
      dataPadStart = true;
    } else if (centerAlign && !alignCenter) {
      rightAlign = true;
      dataPadStart = true;
    } else if (alignEnd && !rightAlign) {
      rightAlign = true;
      dataPadStart = true;
    } else if (alignStart) {
      dataPadEnd = true;
    }

    const independentItemProps = {
      // isInsidePanel: false,
      "data-is-inside-panel": false,
      className: classnames("toolbar-item", props?.className),
    };
    const toolbarItemProps = {
      id: getId(toolbarId, childItem, index),
      onKeyDown: handleKeyDown,
      "data-index": index,
      "data-priority": props["data-priority"] ?? 2,
      "data-pad-start": dataPadStart || undefined,
      "data-pad-end": dataPadEnd || undefined,
      "data-collapsed": collapsed,
      "data-collapsing": collapsing,
      "data-overflowed": overflowed,
      orientation,
    };

    if (!wrapChildrenWithFormFields) {
      return React.cloneElement(childItem, toolbarItemProps);
    }

    switch (childItem.type) {
      case Tooltray:
        return React.cloneElement(childItem, toolbarItemProps);
      case FormField:
        return React.cloneElement(childItem, {
          ...toolbarItemProps,
          ...independentItemProps,
          ...fieldProps,
          // @ts-ignore
          variant: childItem.props?.variant ?? "transparent",
        } as any);
      default:
        return renderToolbarField(
          childItem,
          toolbarItemProps,
          independentItemProps,
          index
        );
    }
  });
};
