import { makePrefixer } from "@salt-ds/core";
import { TriangleRightIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";

import treeNodeCss from "./TreeNode.css";

const withBaseName = makePrefixer("saltTreeNode");
export interface TreeNodeProps
  extends Omit<HTMLAttributes<HTMLLIElement>, "onMouseEnter"> {
  children?: ReactNode;
  description?: string;
  highlighted?: boolean;
  idx?: number;
  isLeaf?: boolean;
  label?: string;
  onMouseEnter?: MouseEventHandler;
  selected?: boolean;
}

export const TreeNode = ({
  "aria-level": ariaLevel,
  children,
  className: classNameProp,
  description,
  highlighted,
  idx,
  isLeaf = false,
  label,
  onMouseEnter,
  selected,
  ...props
}: TreeNodeProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tree-node",
    css: treeNodeCss,
    window: targetWindow,
  });

  const className = clsx(withBaseName(), classNameProp, {
    [withBaseName("highlighted")]: highlighted,
  });

  return (
    <li {...props} className={className} role="presentation">
      <div
        aria-level={ariaLevel}
        aria-selected={selected || undefined}
        className={withBaseName("item")}
        onMouseEnter={onMouseEnter}
        role="treeitem"
      >
        {isLeaf === false ? (
          <span className={withBaseName("toggle")} data-toggle={true}>
            <TriangleRightIcon />
          </span>
        ) : null}
        <div className={withBaseName("label")}>
          {/* {child.icon ? <span className={`${classBase}Node-icon`} /> : null} */}
          {label}
        </div>
        {description !== undefined ? (
          <div className={withBaseName("description")}>{description}</div>
        ) : null}
      </div>
      {children}
    </li>
  );
};
