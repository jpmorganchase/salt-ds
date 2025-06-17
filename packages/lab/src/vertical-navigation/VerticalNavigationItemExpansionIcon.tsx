import { useIcon } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useCollapsibleContext } from "../collapsible/CollapsibleContext";

export const VerticalNavigationItemExpansionIcon = (props: IconProps) => {
  const { CollapseIcon, ExpandIcon } = useIcon();
  const iconExpansionMap = {
    expanded: CollapseIcon,
    collapsed: ExpandIcon,
  };

  const { expanded } = useCollapsibleContext();

  const Icon = iconExpansionMap[expanded ? "expanded" : "collapsed"];
  return (
    <Icon className="saltVerticalNavigationItem-indicator" aria-hidden="true" />
  );
};
