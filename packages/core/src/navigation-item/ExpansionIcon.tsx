import { useIcon } from "../semantic-icon-provider";

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

export const ExpansionIcon = ({
  expanded = false,
  orientation = "horizontal",
}: ExpansionIconProps) => {
  const { ExpandGroupIcon, CollapseGroupIcon } = useIcon();
  const iconExpansionMap = {
    vertical: {
      expanded: CollapseGroupIcon,
      collapsed: ExpandGroupIcon,
    },
    horizontal: {
      expanded: CollapseGroupIcon,
      collapsed: CollapseGroupIcon,
    },
  };

  const Icon =
    iconExpansionMap[orientation][expanded ? "expanded" : "collapsed"];
  return <Icon aria-hidden="true" />;
};
