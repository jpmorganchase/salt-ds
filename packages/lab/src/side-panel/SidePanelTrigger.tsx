import { mergeProps, useId } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useContext,
  useRef,
} from "react";
import { SidePanelGroupContext } from "./SidePanelGroupContext";

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
  const sidePanelGroup = useContext(SidePanelGroupContext);
  const triggerRef = useRef<HTMLElement | null>(null);
  const triggerId = useId();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (sidePanelGroup && triggerRef.current) {
      // Contextual behavior:
      // - If this trigger is already active and panel is open => close panel
      // - If this trigger is inactive or different trigger is active => activate this trigger
      const isCurrentTrigger =
        sidePanelGroup.open && sidePanelGroup.activeTriggerId === triggerId;

      if (isCurrentTrigger) {
        // Same trigger while open => close
        sidePanelGroup.setOpen(false);
      } else if (triggerId) {
        // Different trigger or closed => activate and open
        sidePanelGroup.activateTrigger(triggerId, triggerRef);
      }
    }
    onClick?.(event);
  };

  if (!children || !isValidElement<{ ref?: Ref<unknown> }>(children)) {
    return <>{children}</>;
  }

  const mergedProps = mergeProps(
    {
      onClick: handleClick,
      ...rest,
    },
    children.props,
  );

  if (sidePanelGroup) {
    mergedProps["aria-expanded"] =
      sidePanelGroup.open && sidePanelGroup.activeTriggerId === triggerId;
    mergedProps["aria-controls"] = sidePanelGroup.panelId;
  }

  return cloneElement(children, {
    ...mergedProps,
    ref: (element: unknown) => {
      triggerRef.current = element as HTMLElement | null;
      if (typeof ref === "function") {
        ref(element as HTMLButtonElement | null);
      } else if (ref) {
        ref.current = element as HTMLButtonElement;
      }
    },
  });
});
