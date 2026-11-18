import { cloneElement, type HTMLAttributes, type ReactElement } from "react";
import {
  isCollapsedOrCollapsing,
  liftResponsivePropsToFormField,
  type OverflowCollectionHookResult,
  type OverflowItem,
  type orientationType,
} from "../../responsive";
import type { ToolbarAlignmentProps } from "../ToolbarProps";

import { Tooltray } from "../Tooltray";
import { ToolbarField, type ToolbarFieldProps } from "../toolbar-field";

// These are the props we use for item alignment, either from individual element
// declarations - e.g Tooltray (alignLeft etc) or generic data- attributes
interface ToolbarElementProps
  extends ToolbarAlignmentProps,
    HTMLAttributes<HTMLDivElement> {
  "data-align-center"?: boolean;
  "data-align-end"?: boolean;
  "data-align-start"?: boolean;
  "data-priority"?: number;
}

export const renderToolbarItems = (
  collectionHook: OverflowCollectionHookResult,
  overflowedItems: OverflowItem[],
  orientation: orientationType,
): ReactElement[] => {
  let centerAlign = false;
  let rightAlign = false;

  const items = collectionHook.data;
  const collapseItems = items.filter(isCollapsedOrCollapsing);

  return items
    .filter((item) => !item.isOverflowIndicator)
    .map((item: OverflowItem, index) => {
      const element = item.element as ReactElement<Record<string, unknown>>;
      const props = element.props as ToolbarElementProps;
      const overflowed =
        overflowedItems.findIndex((item) => item.index === index) === -1
          ? undefined
          : true;
      const collapseItem = collapseItems.find((item) => item.index === index);
      const collapsed = collapseItem?.collapsed || undefined;
      const collapsing = collapseItem?.collapsing || undefined;

      const {
        alignCenter: alignCenterProp,
        alignEnd: alignEndProp,
        alignStart: alignStartProp,
        "data-align-center": alignCenter = alignCenterProp,
        "data-align-end": alignEnd = alignEndProp,
        "data-align-start": alignStart = alignStartProp,
      } = props;

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

      const toolbarItemProps = {
        id: item.id,
        "data-index": index,
        "data-priority": props["data-priority"] ?? 2,
        "data-pad-start": dataPadStart || undefined,
        "data-pad-end": dataPadEnd || undefined,
        "data-collapsed": collapsed,
        "data-collapsing": collapsing,
        "data-overflowed": overflowed,
        orientation,
      };

      if (element.type === Tooltray) {
        return cloneElement(element, { ...toolbarItemProps, key: item.id });
      }
      switch (element.type) {
        case ToolbarField: {
          const props = element.props as ToolbarFieldProps;
          return cloneElement(
            element as ReactElement<ToolbarFieldProps>,
            {
              ...toolbarItemProps,
              key: item.id,
              children: cloneElement(
                props.children as ReactElement<{ id?: string }>,
                {
                  // Inject an id that nested Control can use to query status via context
                  id: `toolbar-control-${item.id}`,
                },
              ),
            } as ToolbarFieldProps,
          );
        }
        default: {
          const [responsiveProps, componentProps] =
            liftResponsivePropsToFormField(element.props);

          return (
            <ToolbarField
              key={item.id}
              {...responsiveProps}
              {...toolbarItemProps}
            >
              {cloneElement(element, {
                ...componentProps,
                // Inject an id that nested Control can use to query status via context
                id: `toolbar-control-${item.id}`,
              })}
            </ToolbarField>
          );
        }
      }
    });
};
