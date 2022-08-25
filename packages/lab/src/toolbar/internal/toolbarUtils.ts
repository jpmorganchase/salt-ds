import { Children, ReactElement } from "react";
import { OverflowItem } from "../../responsive";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarField, ToolbarFieldProps } from "../toolbar-field";
import { Tooltray } from "../Tooltray";
import { TooltrayProps } from "../TooltrayProps";

const isAToolbarField = (el: ReactElement) => el.type === ToolbarField;
const isAToolbarButton = (el: ReactElement): boolean => {
  if (el.type === ToolbarButton) {
    return true;
  }
  if (isAToolbarField(el)) {
    const props = el.props as ToolbarFieldProps;
    const children = Children.toArray(props.children) as ReactElement[];
    return children.length === 1 && isAToolbarButton(children[0]);
  }
  return false;
};

const isAButtonOnlyTooltray = (el: ReactElement) => {
  if (el.type === Tooltray) {
    const props = el.props as TooltrayProps;
    const children = props.children as ReactElement[];
    if (children.every(isAToolbarButton)) return true;
  }
  return false;
};

export const allItemsAreToolbarButtons = (
  items: OverflowItem<"child">[]
): boolean => {
  if (
    items.some((item) => {
      if (item.isOverflowIndicator) return false;
      if (isAToolbarButton(item.element)) return false;
      if (isAButtonOnlyTooltray(item.element)) return false;
      return true;
    })
  ) {
    return false;
  } else {
    return true;
  }
};
