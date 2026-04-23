import { mergeProps, useForkRef } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  useCallback,
} from "react";
import { useSidePanelContext } from "./SidePanelContext";

export interface SidePanelTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children: ReactNode;
}

export const SidePanelTrigger = forwardRef<
  HTMLButtonElement,
  SidePanelTriggerProps
>(function SidePanelTrigger(props, ref) {
  const { children, onClick, ...rest } = props;
  const { setReference, getReferenceProps, openState, setOpen, panelId } =
    useSidePanelContext();

  const handleRef = useForkRef(setReference, ref);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setOpen(!openState);
      }
    },
    [onClick, openState, setOpen],
  );

  if (!children || !isValidElement<{ ref?: unknown }>(children)) {
    return <>{children}</>;
  }

  const mergedProps = mergeProps(
    getReferenceProps({
      "aria-expanded": openState,
      "aria-controls": openState ? panelId : undefined,
      ...rest,
      onClick: handleClick,
    }) as Record<string, unknown>,
    children.props,
  );

  return cloneElement(children, {
    ...mergedProps,
    ref: handleRef,
  });
});
