import { FormField, FormFieldProps } from "@jpmorganchase/uitk-core";
import React, { KeyboardEvent, ReactElement } from "react";
import classnames from "classnames";

import Tooltray from "../Tooltray";
import {
  DropdownPlaceholder,
  extractResponsiveProps,
  isResponsiveAttribute,
  orientationType,
  OverflowItem,
  OverflowCollectionHookResult,
} from "../../responsive";

const fieldProps = {
  fullWidth: false,
  labelPlacement: "top",
};

const NullActivationIndicator = () => null;

export const renderToolbarItems = (
  collectionHook: OverflowCollectionHookResult,
  handleKeyDown: (evt: KeyboardEvent<HTMLElement>) => void,
  overflowedItems: OverflowItem[] = [],
  collapseItems: OverflowItem[] = [],
  orientation: orientationType,
  wrapChildrenWithFormFields = true
): JSX.Element[] => {
  let centerAlign = false;
  let rightAlign = false;

  const items = collectionHook.data;

  return items
    .filter((item) => !item.isOverflowIndicator)
    .map((item: OverflowItem, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props = item.element.props;
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
      } = item.element.props;

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
        className: classnames(
          "uitkToolbarField",
          "uitkEmphasisMedium",
          props?.className
        ),
      };
      const toolbarItemProps = {
        id: item.id,
        key: item.id,
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
        return React.cloneElement(item.element, toolbarItemProps);
      }

      switch (item.element.type) {
        case Tooltray:
          return React.cloneElement(item.element, toolbarItemProps);
        case FormField:
          const props = item.element.props as FormFieldProps;
          return React.cloneElement(item.element, {
            ...toolbarItemProps,
            ...independentItemProps,
            ...fieldProps,
            disableFocusRing: true,
            labelPlacement: props?.labelPlacement ?? "left",
            // variant: props?.emphasis ?? "low",
            children: React.cloneElement(props.children as ReactElement, {
              // Inject an id that nested Control can use to query status via context
              id: `toolbar-control-${toolbarItemProps.id}`,
            }),
          } as FormFieldProps);
        case DropdownPlaceholder:
          console.log("WE HAVE A DROPDOWN PLACEHOLDER");
          return item.element;
        default:
          const [responsiveProps, componentProps] = Object.keys(
            item.element.props
          ).some(isResponsiveAttribute)
            ? extractResponsiveProps(item.element.props)
            : [{}, item.element.props];

          return (
            <FormField
              ActivationIndicatorComponent={NullActivationIndicator}
              {...responsiveProps}
              {...toolbarItemProps}
              {...fieldProps}
              disableFocusRing={true}
              {...independentItemProps}
            >
              {React.cloneElement(item.element, {
                ...componentProps,
                // Inject an id that nested Control can use to query status via context
                id: `toolbar-control-${toolbarItemProps.id}`,
              })}
            </FormField>
          );
      }
    });
};
