import { HTMLAttributes, MouseEventHandler } from "react";
import cx from "classnames";
import { TriangleRightIcon } from "@jpmorganchase/uitk-icons";

import { makePrefixer } from "@jpmorganchase/uitk-core";

import "./TreeNode.css";

const withBaseName = makePrefixer("uitkTreeNode");
export interface TreeNodeProps
  extends Omit<HTMLAttributes<HTMLLIElement>, "onMouseEnter"> {
  children?: React.ReactNode;
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
  const className = cx(withBaseName(), classNameProp, {
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
