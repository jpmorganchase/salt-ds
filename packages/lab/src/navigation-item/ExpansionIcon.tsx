import { ChevronDownIcon, ChevronRightIcon } from "@salt-ds/icons";
import { NavigationItemProps } from "./NavigationItem";

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

export function ExpansionIcon({
  expanded = false,
  orientation = "horizontal",
  className,
}: Pick<NavigationItemProps, "expanded" | "orientation" | "className">) {
  const Icon =
    iconExpansionMap[orientation][expanded ? "expanded" : "collapsed"];
  return <Icon aria-hidden="true" className={className} />;
}
