import clsx from "clsx";
import { makePrefixer } from "packages/core/src";
import { useComponentCssInjection } from "packages/styles/src";
import { useWindow } from "packages/window/src";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { TreeNodeProvider, useTreeContext } from "./TreeContext";
import treeNodeCss from "./TreeNode.css";

interface TreeNodeProps extends ComponentPropsWithoutRef<"li"> {
  disabled?: boolean;
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

interface TreeNodeInternalProps {
  _posinset?: number;
  _setsize?: number;
}

const withBaseName = makePrefixer("saltTreeNode");

export const TreeNode = forwardRef<
  HTMLLIElement,
  TreeNodeProps & TreeNodeInternalProps
>(function TreeNode(props, ref) {
  const { value, label, disabled, children, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tree-node",
    css: treeNodeCss,
    window: targetWindow,
  });

  const nodeRef = useRef<HTMLLIElement>(null);
  const hasChildren = children != null;
  const expanded = true;
  const level = 1;

  const { registerNode } = useTreeContext();

  useEffect(() => {
    if (nodeRef.current) {
      return registerNode(value, nodeRef.current, undefined, undefined);
    }
  }, []);

  const nodeContext = useMemo(
    () => ({
      value,
      level,
      hasChildren,
      expanded,
      disabled,
    }),
    [value, level, hasChildren, expanded, disabled],
  );

  return (
    <TreeNodeProvider value={nodeContext}>
      <li
        ref={nodeRef}
        role="treeitem"
        className={clsx(withBaseName(), {
          [withBaseName("disabled")]: disabled,
        })}
        {...rest}
        style={{ "--saltTreeNode-level": level } as CSSProperties}
      >
        <div className={withBaseName("content")}>
          <span className={withBaseName("label")}>{label}</span>
        </div>
      </li>
    </TreeNodeProvider>
  );
});
