import type { IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import { useCollapsibleContext } from "../collapsible/CollapsibleContext";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";

const withBaseName = makePrefixer("saltVerticalNavigationItemExpansionIcon");

export const VerticalNavigationItemExpansionIcon = (
  props: IconProps,
): ReactElement => {
  const { className, ...rest } = props;
  const { CollapseIcon, ExpandIcon } = useIcon();
  const iconExpansionMap = {
    expanded: CollapseIcon,
    collapsed: ExpandIcon,
  };

  const { open } = useCollapsibleContext();

  const Icon = iconExpansionMap[open ? "expanded" : "collapsed"];
  return (
    <Icon
      className={clsx(withBaseName(), className)}
      aria-hidden="true"
      {...rest}
    />
  );
};
