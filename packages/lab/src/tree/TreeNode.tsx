import { makePrefixer, useId } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  type ComponentType,
  forwardRef,
  isValidElement,
  type ReactNode,
  useImperativeHandle,
  useMemo,
} from "react";
import {
  TreeNodeProvider,
  useTreeContext,
  useTreeNodeContext,
} from "./TreeContext";
import treeNodeCss from "./TreeNode.css";
import { TreeNodeLabel } from "./TreeNodeLabel";
import { TreeNodeTrigger } from "./TreeNodeTrigger";

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

  Children.forEach(children, (child) => {
    if (isValidElement(child) && typeof child.props.value === "string") {
      nodeChildren.push(child);
    } else if (child != null) {
      contentChildren.push(child);
    }
  });

  return { contentChildren, nodeChildren };
}

export const TreeNode = forwardRef<HTMLLIElement, TreeNodeProps>(
  function TreeNode(props, ref) {
    const {
      value,
      label,
      icon: Icon,
      disabled: disabledProp = false,
      children,
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tree-node",
      css: treeNodeCss,
      window: targetWindow,
    });

    const id = useId(value) ?? value;

    const {
      expandedState,
      selectedState,
      disabled: treeDisabled,
      disabledIdsSet,
      indeterminateState,
      getElement,
    } = useTreeContext();

    const parentContext = useTreeNodeContext();
    const level = (parentContext?.level ?? 0) + 1;

    const disabled = treeDisabled || disabledProp || disabledIdsSet.has(value);
    const expanded = expandedState.has(value);
    const selected = selectedState.includes(value);
    const indeterminate = indeterminateState.has(value);

    const usesLabelProp = label !== undefined;
    const { contentChildren, nodeChildren } = useMemo(
      () =>
        usesLabelProp
          ? { contentChildren: [], nodeChildren: Children.toArray(children) }
          : separateChildren(children),
      [children, usesLabelProp],
    );

    const hasChildren = nodeChildren.length > 0;

    // Forward ref to the <li> element rendered by TreeNodeTrigger
    useImperativeHandle(ref, () => getElement(value) as HTMLLIElement, [
      getElement,
      value,
    ]);

    const nodeContext = useMemo(
      () => ({
        value,
        level,
        hasChildren,
        expanded,
        disabled,
        id,
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
        selected,
        indeterminate,
        nodeChildren,
      ],
    );

    const defaultContent = usesLabelProp ? (
      <TreeNodeTrigger>
        {Icon ? <Icon aria-hidden className={withBaseName("icon")} /> : null}
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
