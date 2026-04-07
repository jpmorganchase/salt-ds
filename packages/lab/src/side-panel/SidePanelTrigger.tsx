import { mergeProps, useForkRef } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  useRef,
} from "react";
import { useSidePanelGroup } from "./SidePanelGroupContext";

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
  const { open, triggerRef: groupTriggerRef, setOpen, activateTrigger, panelId } =
    useSidePanelGroup();
  const triggerRef = useRef<HTMLElement | null>(null);
  const handleRef = useForkRef(triggerRef, ref);
  const isActive = open && groupTriggerRef?.current === triggerRef.current;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!triggerRef.current) {
      return;
    }

    if (isActive) {
      setOpen?.(false);
      return;
    }

    activateTrigger(triggerRef);
  };

  if (!children || !isValidElement<{ ref?: unknown }>(children)) {
    return <>{children}</>;
  }
  const mergedProps = mergeProps(
    {
      onClick: handleClick,
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
