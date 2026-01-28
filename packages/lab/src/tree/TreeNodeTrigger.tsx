import { CheckboxIcon, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTreeContext, useTreeNodeContext } from "./TreeContext";
import treeNodeCss from "./TreeNode.css";
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
  useComponentCssInjection({
    testId: "salt-tree-node",
    css: treeNodeCss,
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
    labelId,
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
  const triggerContentRef = useRef<HTMLSpanElement>(null);
  const wasMouseDownRef = useRef(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const isActive = activeNode === value;

  const isTabbable = !disabled && tabbableNodeId === value;

  // Expose the trigger content span for tooltip positioning
  // The li handles focus and ARIA, but positioning should be relative to the visual row
  useImperativeHandle(
    ref,
    () => triggerContentRef.current as HTMLSpanElement,
    [],
  );

  useEffect(() => {
    if (nodeRef.current) {
      return registerElement(value, nodeRef.current);
    }
  }, [value, registerElement]);

  const handleClick = (event: MouseEvent<HTMLLIElement>) => {
    onClick?.(event);
    if (disabled) return;
    // Only handle click if it's on the node content, not on nested items
    const target = event.target as HTMLElement;
    const nestedTreeItem = target.closest('[role="treeitem"]');
    if (nestedTreeItem && nestedTreeItem !== nodeRef.current) {
      return;
    }
    setActiveNode(value);
    select(event, value);
  };

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    if (event.target !== nodeRef.current) return;
    if (!wasMouseDownRef.current) {
      setFocusVisible(true);
    }
    wasMouseDownRef.current = false;
    onFocus?.(event);
    if (!disabled) {
      setActiveNode(value);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (event.target !== nodeRef.current) return;
    setFocusVisible(false);
    onBlur?.(event);
  };

  const handleMouseDown = (event: MouseEvent<HTMLLIElement>) => {
    wasMouseDownRef.current = true;
    onMouseDown?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(event);
  };

  return (
    <li
      ref={nodeRef}
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
        } as CSSProperties
      }
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
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
