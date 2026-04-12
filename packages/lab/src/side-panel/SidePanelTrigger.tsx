import { mergeProps, useForkRef } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useRef,
} from "react";
import { useSidePanelContext } from "./SidePanelContext";

export interface SidePanelTriggerProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "aria-controls" | "aria-expanded"
  > {
  children: ReactNode;
}

export const SidePanelTrigger = forwardRef<
  HTMLButtonElement,
  SidePanelTriggerProps
>(function SidePanelTrigger(props, ref) {
  const { children, onClick, ...rest } = props;
  const {
    openState,
    triggerRef: groupTriggerRef,
    setOpen,
    activateTrigger,
    panelId,
  } = useSidePanelContext();
  const triggerRef = useRef<HTMLElement | null>(null);
  const handleRef = useForkRef(triggerRef, ref);
  const isActive = openState && groupTriggerRef?.current === triggerRef.current;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!triggerRef.current) {
      return;
    }

    activateTrigger(triggerRef);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && openState) {
      event.stopPropagation();
      setOpen(false);
    }
  };

  if (!children || !isValidElement<{ ref?: unknown }>(children)) {
    return <>{children}</>;
  }

  const mergedProps = mergeProps(
    {
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      ...rest,
    },
    children.props,
  );

  // Set aria attributes
  mergedProps["aria-expanded"] = isActive;
  mergedProps["aria-controls"] = panelId;

  return cloneElement(children, {
    ...mergedProps,
    ref: handleRef,
  });
});
