import {
  useState,
  useContext,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
  useEffect,
} from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { makePrefixer, useId, Text } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  DepthContext,
  TreeContext,
  ParentContext,
  ActiveIdContext,
  SetActiveIdContext,
} from "./Tree.Provider";
import treeNodeCSS from "./TreeNode.css";
import { Tree } from "./Tree";

export namespace TreeNode {
  export interface Props extends ComponentPropsWithoutRef<"li"> {
    label: string;
    value?: string;
    subnodes?: TreeNode.Record[];
    children?: ReactNode;
  }

  export type Record =
    | (Omit<Props, "children"> & { id: string; parent: TreeNode.Record | null })
    | (Omit<Props, "children"> & {
        key: string;
        parent: TreeNode.Record | null;
      });

  export type Depth = number;
}

const withBaseName = makePrefixer("saltTreeNode");

export function TreeNode({
  id: idProp,
  label,
  value,
  className,
  style,
  subnodes = [],
  children,
  ...props
}: TreeNode.Props) {
  const id = useId(idProp) as string;
  const targetWindow = useWindow();
  const depth = useContext(DepthContext);
  const tree = useContext(TreeContext);
  const parent = useContext(ParentContext);
  const activeId = useContext(ActiveIdContext);
  const setActiveId = useContext(SetActiveIdContext);
  const [expanded, setExpanded] = useState(false);

  const node: TreeNode.Record = { id, label, value, parent };

  useComponentCssInjection({
    testId: "salt-tree-node",
    css: treeNodeCSS,
    window: targetWindow,
  });

  useEffect(() => {
    if (parent) {
      parent.subnodes ||= [];
      parent.subnodes.push(node);
    } else {
      tree.current.push(node);
    }
  }, []);

  useEffect(() => {
    if (!activeId) {
      setActiveId(id);
    }
  });

  const hasNestedNodes = !!children || !!subnodes;
  const leaf = !children && !subnodes;

  function handleClick(event: MouseEvent<HTMLLIElement>) {
    event.stopPropagation();
    setExpanded(!expanded);
  }

  return (
    <li
      id={id}
      data-leaf={leaf}
      data-depth={depth}
      role="treeitem"
      aria-expanded={expanded}
      tabIndex={id === activeId ? 0 : -1}
      className={clsx(withBaseName(), leaf && withBaseName("leaf"), className)}
      style={
        {
          "--saltTreeNode-depth": depth,
          ...style,
        } as CSSProperties
      }
      {...props}
      onClick={handleClick}
    >
      <Text>{label}</Text>
      {hasNestedNodes && (
        <Tree parent={node}>
          {children}
          {subnodes?.map((node) => (
            <TreeNode key={node.key || node.id} {...node} />
          ))}
        </Tree>
      )}
    </li>
  );
}
