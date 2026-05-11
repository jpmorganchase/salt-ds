import { makePrefixer, useForkRef, useIdMemo } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type ComponentType,
  forwardRef,
  type ReactNode,
  useMemo,
  useRef,
} from "react";
import {
  TreeNodeProvider,
  useTreeContext,
  useTreeNodeContext,
} from "./TreeContext";
import treeNodeCss from "./TreeNode.css";
import { TreeNodeLabel } from "./TreeNodeLabel";
import { TreeNodeTrigger } from "./TreeNodeTrigger";
import { flattenTreeNodeChildren, isTreeNodeElement } from "./treeModel";

export interface TreeNodeProps {
  /**
   * Unique value representing this node within the tree
   */
  value: string;
  /**
   * Label for the node. When provided, TreeNode automatically renders a TreeNodeTrigger.
   */
  label?: ReactNode;
  /**
   * Optional icon to display before the label
   */
  icon?: ComponentType<IconProps>;
  /**
   * Whether the node is disabled.
   */
  disabled?: boolean;
  /**
   * Child nodes or content.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltTreeNode");

// Need to take another look at this because its slightly brittle - alternative could be:
// TreeNode having a 'content' prop that takes <TreeNodeTrigger> etc. and then `children` is reserved for other <TreeNode>'s
// or a 'render' prop if we want to pass any state down. Simplifies it massively because then its clear children is for sub trees.
function separateChildren(children: ReactNode): {
  contentChildren: ReactNode[];
  nodeChildren: ReactNode[];
} {
  const contentChildren: ReactNode[] = [];
  const nodeChildren: ReactNode[] = [];

  for (const child of flattenTreeNodeChildren(children)) {
    if (isTreeNodeElement(child)) {
      nodeChildren.push(child);
    } else {
      contentChildren.push(child);
    }
  }

  return { contentChildren, nodeChildren };
}

export const TreeNode = forwardRef<HTMLLIElement, TreeNodeProps>(
  function TreeNode(props, ref) {
    const {
      value,
      label,
      icon: Icon,
      disabled: disabledProp,
      children,
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tree-node",
      css: treeNodeCss,
      window: targetWindow,
    });

    const id = useIdMemo();

    const {
      expandedState,
      selectedSet,
      disabled: treeDisabled,
      disabledIdsSet,
      indeterminateState,
    } = useTreeContext();

    const parentContext = useTreeNodeContext();
    const level = (parentContext?.level ?? 0) + 1;

    const disabled =
      treeDisabled ||
      parentContext?.disabled ||
      disabledProp ||
      disabledIdsSet.has(value);
    const expanded = expandedState.has(value);
    const selected = selectedSet.has(value);
    const indeterminate = indeterminateState.has(value);

    const usesLabelProp = label !== undefined;
    const { contentChildren, nodeChildren } = useMemo(
      () =>
        usesLabelProp
          ? {
              contentChildren: [],
              nodeChildren: flattenTreeNodeChildren(children),
            }
          : separateChildren(children),
      [children, usesLabelProp],
    );

    const hasChildren = nodeChildren.some(isTreeNodeElement);

    const nodeRef = useRef<HTMLLIElement>(null);
    const setNodeRef = useForkRef(nodeRef, ref);

    const nodeContext = useMemo(
      () => ({
        value,
        level,
        hasChildren,
        expanded,
        disabled,
        id,
        nodeRef,
        setNodeRef,
        selected,
        indeterminate,
        nodeChildren,
      }),
      [
        value,
        level,
        hasChildren,
        expanded,
        disabled,
        id,
        setNodeRef,
        selected,
        indeterminate,
        nodeChildren,
      ],
    );

    const defaultContent = usesLabelProp ? (
      <TreeNodeTrigger>
        {Icon ? (
          <span className={withBaseName("icon")}>
            <Icon aria-hidden />
          </span>
        ) : null}
        <TreeNodeLabel>{label}</TreeNodeLabel>
      </TreeNodeTrigger>
    ) : null;

    return (
      <TreeNodeProvider value={nodeContext}>
        {usesLabelProp ? defaultContent : contentChildren}
      </TreeNodeProvider>
    );
  },
);
