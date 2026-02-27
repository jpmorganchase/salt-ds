import { makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
} from "react";
import { useTreeContext, useTreeNodeContext } from "./TreeContext";
import treeNodeExpansionIconCss from "./TreeNodeExpansionIcon.css";

export interface TreeNodeExpansionIconProps
  extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltTreeNodeExpansionIcon");

export const TreeNodeExpansionIcon = forwardRef<
  HTMLSpanElement,
  TreeNodeExpansionIconProps
>(function TreeNodeExpansionIcon(props, ref) {
  const { className, onClick, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tree-node-expansion-icon",
    css: treeNodeExpansionIconCss,
    window: targetWindow,
  });

  const nodeContext = useTreeNodeContext();
  if (!nodeContext) {
    throw new Error("TreeNodeExpansionIcon must be used within a TreeNode");
  }

  const { value, hasChildren, expanded, disabled } = nodeContext;
  const { toggleExpanded } = useTreeContext();
  const { ExpandGroupIcon, CollapseGroupIcon } = useIcon();

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
    if (disabled || !hasChildren) return;
    toggleExpanded(event, value);
  };

  if (!hasChildren) {
    return (
      <span
        ref={ref}
        className={clsx(withBaseName(), withBaseName("placeholder"), className)}
        aria-hidden
        {...rest}
      />
    );
  }

  const Icon = expanded ? CollapseGroupIcon : ExpandGroupIcon;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled at tree level, same as W3C
    <span
      ref={ref}
      className={clsx(withBaseName(), className)}
      onClick={handleClick}
      aria-hidden
      {...rest}
    >
      <Icon className={withBaseName("icon")} />
    </span>
  );
});
