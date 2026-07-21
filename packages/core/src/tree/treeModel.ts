import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export interface TreeNodeMeta {
  value: string;
  parentValue: string | undefined;
  hasChildren: boolean;
  disabled: boolean;
}

export interface TreeModel {
  /** All nodes indexed by value */
  nodes: Map<string, TreeNodeMeta>;
  /** Ordered list of root node values */
  rootValues: string[];
  /** Maps parent value to ordered list of child values */
  childrenOf: Map<string, string[]>;
}

interface TreeNodeElementProps {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

function isFragmentElement(
  child: ReactNode,
): child is ReactElement<{ children?: ReactNode }> {
  return (
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
  );
}

export function isTreeNodeElement(
  child: ReactNode,
): child is ReactElement<TreeNodeElementProps> {
  return (
    isValidElement<TreeNodeElementProps>(child) &&
    typeof child.props.value === "string"
  );
}

export function flattenTreeNodeChildren(children: ReactNode): ReactNode[] {
  const flattenedChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isFragmentElement(child)) {
      flattenedChildren.push(...flattenTreeNodeChildren(child.props.children));
    } else if (
      child !== null &&
      child !== undefined &&
      typeof child !== "boolean"
    ) {
      flattenedChildren.push(child);
    }
  });

  return flattenedChildren;
}

function getTreeNodeElements(
  children: ReactNode,
): ReactElement<TreeNodeElementProps>[] {
  return flattenTreeNodeChildren(children).filter(isTreeNodeElement);
}

export function buildTreeModel(children: ReactNode): TreeModel {
  const nodes = new Map<string, TreeNodeMeta>();
  const rootValues: string[] = [];
  const childrenOf = new Map<string, string[]>();

  function traverse(
    reactChildren: ReactNode,
    parentValue?: string,
    parentDisabled = false,
  ): void {
    const treeNodeChildren = getTreeNodeElements(reactChildren);
    const siblingValues: string[] = [];

    for (const child of treeNodeChildren) {
      const value = child.props.value;
      const childTreeNodes = getTreeNodeElements(child.props.children);
      const hasChildren = childTreeNodes.length > 0;
      const disabled = parentDisabled || Boolean(child.props.disabled);

      nodes.set(value, {
        value,
        parentValue,
        hasChildren,
        disabled,
      });

      siblingValues.push(value);

      if (hasChildren) {
        traverse(child.props.children, value, disabled);
      }
    }

    if (parentValue !== undefined) {
      childrenOf.set(parentValue, siblingValues);
    } else {
      rootValues.push(...siblingValues);
    }
  }

  traverse(children);

  return { nodes, rootValues, childrenOf };
}
