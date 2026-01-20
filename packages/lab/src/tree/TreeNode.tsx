import { CheckboxIcon, makePrefixer, useForkRef, useId } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type CSSProperties,
  forwardRef,
  isValidElement,
  type ReactNode,
  useEffect,
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

export interface TreeNodeProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * Unique value representing this node within the tree
   */
  value: string;
  /**
   * Label for the node.
   */
  label?: ReactNode;
  /**
   * Optional icon to display before the label
   */
  icon?: ComponentType<IconProps>;
  /**
   * Whether the node is disabled.
   * Disabled nodes cannot be selected, expanded, or interacted with.
   * Inherits disabled state from parent nodes and tree-level disabled prop.
   */
  disabled?: boolean;
  /**
   * Child nodes. Nested TreeNodes create a hierarchy.
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
      className,
      id: idProp,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tree-node",
      css: treeNodeCss,
      window: targetWindow,
    });

    const id = useId(idProp);
    const labelId = `${id}-label`;
    const nodeRef = useRef<HTMLLIElement>(null);

    const {
      expandedState,
      selectedState,
      multiselect,
      registerElement,
      activeNode,
      disabled: treeDisabled,
      disabledIdsSet,
      indeterminateState,
    } = useTreeContext();

    const parentContext = useTreeNodeContext();
    const level = (parentContext?.level ?? 0) + 1;

    const disabled = treeDisabled || disabledProp || disabledIdsSet.has(value);
    const expanded = expandedState.has(value);
    const selected = selectedState.includes(value);
    const indeterminate = indeterminateState.has(value);
    const isActive = activeNode === value;

    const usesLabelProp = label !== undefined;
    const { contentChildren, nodeChildren } = useMemo(
      () =>
        usesLabelProp
          ? { contentChildren: [], nodeChildren: [] }
          : separateChildren(children),
      [children, usesLabelProp],
    );

    const nestedChildren = usesLabelProp ? children : nodeChildren;
    const hasChildren = Children.count(nestedChildren) > 0;

    useEffect(() => {
      if (nodeRef.current) {
        return registerElement(value, nodeRef.current);
      }
    }, [value, registerElement]);

    const nodeContext = useMemo(
      () => ({
        value,
        level,
        hasChildren,
        expanded,
        disabled,
        labelId,
      }),
      [value, level, hasChildren, expanded, disabled, labelId],
    );

    const handleRef = useForkRef(nodeRef, ref);

    return (
      <TreeNodeProvider value={nodeContext}>
        <li
          ref={handleRef}
          id={id}
          role="treeitem"
          aria-labelledby={labelId}
          aria-expanded={hasChildren ? expanded : undefined}
          aria-selected={multiselect ? undefined : selected}
          aria-checked={
            multiselect ? (indeterminate ? "mixed" : selected) : undefined
          }
          aria-level={level}
          aria-disabled={disabled || undefined}
          className={clsx(
            withBaseName(),
            {
              [withBaseName("expanded")]: expanded,
              [withBaseName("selected")]: selected && !multiselect,
              [withBaseName("active")]: isActive,
              [withBaseName("disabled")]: disabled,
              [withBaseName("hasChildren")]: hasChildren,
            },
            className,
          )}
          style={
            {
              "--saltTreeNode-level": level,
            } as CSSProperties
          }
          {...rest}
        >
          {usesLabelProp ? (
            <TreeNodeTrigger>
              {multiselect && (
                <CheckboxIcon
                  checked={selected}
                  indeterminate={indeterminate}
                  disabled={disabled}
                  className={withBaseName("checkbox")}
                />
              )}
              {Icon ? <Icon className={withBaseName("icon")} /> : null}
              <TreeNodeLabel>{label}</TreeNodeLabel>
            </TreeNodeTrigger>
          ) : (
            contentChildren
          )}

          {hasChildren && expanded && (
            <ul role="group" className={withBaseName("group")}>
              {nestedChildren}
            </ul>
          )}
        </li>
      </TreeNodeProvider>
    );
  },
);
