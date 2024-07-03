import { ChevronDownIcon, ChevronRightIcon } from "@salt-ds/icons";
import { FC } from "react";

const iconExpansionMap = {
  vertical: {
    expanded: ChevronDownIcon,
    collapsed: ChevronRightIcon,
  },
  horizontal: {
    expanded: ChevronDownIcon,
    collapsed: ChevronDownIcon,
  },
};

interface ExpansionIconProps {
  /**
   * Whether the navigation item is expanded.
   */
  expanded?: boolean;
  /**
   * The orientation of the navigation item.
   */
  orientation?: "horizontal" | "vertical";
}

export const ExpansionIcon: FC<ExpansionIconProps> = ({
  expanded = false,
  orientation = "horizontal",
}) => {
  const Icon =
    iconExpansionMap[orientation][expanded ? "expanded" : "collapsed"];
  return <Icon aria-hidden="true" />;
};
