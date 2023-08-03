import { ChevronDownIcon, ChevronRightIcon } from "@salt-ds/icons";
import { ComponentPropsWithoutRef } from "react";
import { NavItemProps } from "./NavItem";

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
}: Pick<NavItemProps, "expanded" | "orientation"> &
  ComponentPropsWithoutRef<"button">) {
  const Icon =
    iconExpansionMap[orientation][expanded ? "expanded" : "collapsed"];
  return <Icon aria-hidden="true" className={className} />;
}
