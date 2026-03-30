import { mergeProps, useForkRef, useId } from "@salt-ds/core";
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
  const { open, activeTriggerId, setOpen, activateTrigger, panelId } =
    useSidePanelGroup();
  const triggerRef = useRef<HTMLElement | null>(null);
  const triggerId = useId();
  const handleRef = useForkRef(triggerRef, ref);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!triggerRef.current || !triggerId) {
      return;
    }

    const isActiveTriggerOpen = open && activeTriggerId === triggerId;

    if (isActiveTriggerOpen) {
      setOpen(false);
      return;
    }

    activateTrigger(triggerId, triggerRef);
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

  mergedProps["aria-expanded"] = open && activeTriggerId === triggerId;
  mergedProps["aria-controls"] = panelId;

  return cloneElement(children, {
    ...mergedProps,
    ref: handleRef,
  });
});
