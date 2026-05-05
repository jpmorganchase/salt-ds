import { mergeProps, useForkRef } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useSidePanelContext } from "./internal";

export interface SidePanelTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

export const SidePanelTrigger = forwardRef<
  HTMLButtonElement,
  SidePanelTriggerProps
>(function SidePanelTrigger(props, ref) {
  const { children, onClick, ...rest } = props;
  const { setReference, openState, setOpen, panelId } = useSidePanelContext();

  const childRef = (children as { ref?: React.Ref<HTMLButtonElement> })?.ref;
  const combinedRef = useForkRef(setReference, ref);
  const handleRef = useForkRef(combinedRef, childRef);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    setOpen(!openState);
  };

  if (!children || !isValidElement(children)) {
    return <>{children}</>;
  }

  const mergedProps = mergeProps(
    {
      "aria-expanded": openState,
      "aria-controls": openState ? panelId : undefined,
      ...rest,
      onClick: handleClick,
    },
    children.props,
  );

  return cloneElement(children, {
    ...mergedProps,
    ref: handleRef,
  });
});
