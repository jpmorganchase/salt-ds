import { CheckboxIcon, makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTreeContext, useTreeNodeContext } from "./TreeContext";
import { TreeNodeExpansionIcon } from "./TreeNodeExpansionIcon";
import treeNodeTriggerCss from "./TreeNodeTrigger.css";

export interface TreeNodeTriggerProps extends ComponentPropsWithoutRef<"li"> {}

const withBaseName = makePrefixer("saltTreeNodeTrigger");
const withNodeBaseName = makePrefixer("saltTreeNode");

/**
 * The forwarded ref points to the inner trigger content span (for tooltip positioning),
 * while the <li> handles focus, ARIA, and event handling.
 */
export const TreeNodeTrigger = forwardRef<
  HTMLSpanElement,
  TreeNodeTriggerProps
>(function TreeNodeTrigger(props, ref) {
  const {
    className,
    children,
    style,
    onClick,
    onFocus,
    onBlur,
    onMouseDown,
    onKeyDown,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tree-node-trigger",
    css: treeNodeTriggerCss,
    window: targetWindow,
  });

  const nodeContext = useTreeNodeContext();
  if (!nodeContext) {
    throw new Error("TreeNodeTrigger must be used within a TreeNode");
  }

  const {
    value,
    level,
    hasChildren,
    expanded,
    disabled,
    id,
    selected,
    indeterminate,
    nodeChildren,
  } = nodeContext;

  const {
    multiselect,
    activeNode,
    setActiveNode,
    select,
    tabbableNodeId,
    registerElement,
  } = useTreeContext();

  const nodeRef = useRef<HTMLLIElement>(null);
  const triggerContentRef = useForkRef(useRef<HTMLSpanElement>(null), ref);
  const wasMouseDownRef = useRef(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const isActive = activeNode === value;

  const isTabbable = tabbableNodeId === value;

  useEffect(() => {
    if (nodeRef.current) {
      return registerElement(value, nodeRef.current);
    }
  }, [value, registerElement]);

  const handleClick = (event: MouseEvent<HTMLLIElement>) => {
    onClick?.(event);
    if (disabled) return;
    const target = event.target as HTMLElement;
    if (target.closest(".saltTreeNodeExpansionIcon")) return;
    const nestedTreeItem = target.closest('[role="treeitem"]');
    if (nestedTreeItem && nestedTreeItem !== nodeRef.current) {
      return;
    }
    setActiveNode(value);
    select(event, value);
  };

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    onFocus?.(event);
    if (event.target !== event.currentTarget) return;
    if (!wasMouseDownRef.current) {
      setFocusVisible(true);
    }
    wasMouseDownRef.current = false;
    setActiveNode(value);
  };

  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    onBlur?.(event);
    if (event.target !== event.currentTarget) return;
    setFocusVisible(false);
  };

  const handleMouseDown = (event: MouseEvent<HTMLLIElement>) => {
    wasMouseDownRef.current = true;
    onMouseDown?.(event);
  };

  return (
    <li
      ref={nodeRef}
      id={id}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={multiselect ? undefined : selected}
      aria-checked={
        multiselect ? (indeterminate ? "mixed" : selected) : undefined
      }
      aria-level={level}
      aria-disabled={disabled || undefined}
      tabIndex={isTabbable ? 0 : -1}
      className={clsx(
        withNodeBaseName(),
        {
          [withNodeBaseName("expanded")]: expanded,
          [withNodeBaseName("selected")]: selected && !multiselect,
          [withNodeBaseName("active")]: isActive,
          [withNodeBaseName("disabled")]: disabled,
          [withNodeBaseName("hasChildren")]: hasChildren,
          [withNodeBaseName("focusVisible")]: focusVisible,
        },
        className,
      )}
      style={
        {
          "--saltTreeNode-level": level,
          ...style,
        } as CSSProperties
      }
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <span ref={triggerContentRef} className={withBaseName()}>
        <TreeNodeExpansionIcon />
        {multiselect && (
          <CheckboxIcon
            checked={selected}
            indeterminate={indeterminate}
            disabled={disabled}
            className={withNodeBaseName("checkbox")}
          />
        )}
        {children}
      </span>

      {hasChildren && expanded && (
        <ul role="group" className={withNodeBaseName("group")}>
          {nodeChildren}
        </ul>
      )}
    </li>
  );
});
