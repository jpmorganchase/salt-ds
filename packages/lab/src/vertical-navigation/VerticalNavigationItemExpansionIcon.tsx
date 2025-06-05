import { useIcon } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useVerticalNavigationGroup } from "./VerticalNavigationGroup";

export const VerticalNavigationItemExpansionIcon = (props: IconProps) => {
  const { ExpandGroupIcon, ExpandIcon, CollapseGroupIcon } = useIcon();
  const iconExpansionMap = {
    expanded: CollapseGroupIcon,
    collapsed: ExpandGroupIcon,
  };

  const { expanded } = useVerticalNavigationGroup();

  const Icon = iconExpansionMap[expanded ? "expanded" : "collapsed"];
  return (
    <Icon className="saltVerticalNavigationItem-indicator" aria-hidden="true" />
  );
};
