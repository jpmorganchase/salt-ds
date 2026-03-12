import { mergeProps, useForkRef } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useRef,
} from "react";
import { useInlaidPanel } from "./InlaidPanelContext";

export interface InlaidPanelTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children: ReactNode;
}

export const InlaidPanelTrigger = forwardRef<
  HTMLButtonElement,
  InlaidPanelTriggerProps
>(function InlaidPanelTrigger(props, ref) {
  const { children, onClick, ...rest } = props;

  const { open, onOpenChange, panelId, setLastTrigger } = useInlaidPanel();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const handleRef = useForkRef(triggerRef, ref);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    setLastTrigger(triggerRef.current);
    onOpenChange(!open);
  };

  if (!children || !isValidElement<{ ref?: Ref<unknown> }>(children)) {
    return <>{children}</>;
  }

  return cloneElement(children, {
    ...mergeProps(
      {
        ref: handleRef,
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: handleClick,
        ...rest,
      },
      children.props,
    ),
    ref: handleRef,
  });
});
