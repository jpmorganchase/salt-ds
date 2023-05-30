import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@salt-ds/icons";
import { ComponentPropsWithoutRef } from "react";
import { Button } from "@salt-ds/core";
import { NavItemProps } from "./NavItem";

const iconExpansionMap = {
  vertical: {
    expanded: ChevronDownIcon,
    collapsed: ChevronRightIcon,
  },
  horizontal: {
    expanded: ChevronDownIcon,
    collapsed: ChevronUpIcon,
  },
};

export function ExpansionButton({
  expanded = false,
  orientation = "horizontal",
  ...rest
}: Pick<NavItemProps, "expanded" | "orientation"> &
  ComponentPropsWithoutRef<"button">) {
  const Icon =
    iconExpansionMap[orientation][expanded ? "expanded" : "collapsed"];
  return (
    <Button aria-label="expand" variant="secondary" {...rest}>
      <Icon aria-hidden="true" />
    </Button>
  );
}
