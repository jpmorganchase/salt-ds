import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
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

export interface TreeNodeTriggerProps
  extends ComponentPropsWithoutRef<"button"> {}

const withBaseName = makePrefixer("saltTreeNodeTrigger");

export const TreeNodeTrigger = forwardRef<
  HTMLButtonElement,
  TreeNodeTriggerProps
>(function TreeNodeTrigger(props, ref) {
  const {
    className,
    children,
    onClick,
    onFocus,
    onBlur,
    onMouseDown,
    disabled: disabledProp,
    type,
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

  const { value, disabled } = nodeContext;

  const {
    activeNode,
    setActiveNode,
    select,
    registerTrigger,
    getFirstVisibleNode,
    getFirstSelectedVisibleNode,
  } = useTreeContext();

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const wasMouseDownRef = useRef(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const isActive = activeNode === value;
  const firstSelectedVisible = getFirstSelectedVisibleNode();
  const firstVisibleNode = getFirstVisibleNode();

  // Calculate if this trigger should be tabbable
  const isTabbable =
    !disabled &&
    (isActive ||
      (!activeNode &&
        firstSelectedVisible !== undefined &&
        firstSelectedVisible === value) ||
      (!activeNode &&
        firstSelectedVisible === undefined &&
        firstVisibleNode === value));

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (disabled) return;
    setActiveNode(value);
    select(event, value);
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (!wasMouseDownRef.current) {
      setFocusVisible(true);
    }
    wasMouseDownRef.current = false;
    onFocus?.(event);
    if (!disabled && event.target === event.currentTarget) {
      setActiveNode(value);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setFocusVisible(false);
    onBlur?.(event);
  };

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    wasMouseDownRef.current = true;
    onMouseDown?.(event);
  };

  useEffect(() => {
    if (!triggerRef.current) return;
    return registerTrigger(value, triggerRef.current);
  }, [registerTrigger, value]);

  const handleRef = useForkRef(triggerRef, ref);

  return (
    <button
      ref={handleRef}
      className={clsx(
        withBaseName(),
        { [withBaseName("focused")]: focusVisible },
        className,
      )}
      tabIndex={isTabbable ? 0 : -1}
      disabled={disabledProp ?? (disabled || undefined)}
      type={type ?? "button"}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      {...rest}
    >
      <TreeNodeExpansionIcon />
      {children}
    </button>
  );
});
