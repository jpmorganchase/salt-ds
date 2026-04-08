import { mergeProps, useForkRef } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
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
  const { children, ...rest } = props;
  const { setReference, getReferenceProps, panelId, openState, setOpen } =
    useSidePanelContext();

  const handleRef = useForkRef(setReference, ref);

  if (!children || !isValidElement<{ ref?: unknown }>(children)) {
    return <>{children}</>;
  }

  const mergedProps = mergeProps(
    getReferenceProps({
      "aria-controls": panelId,
      onClick: () => setOpen(!openState),
      ...rest,
    }) as Record<string, unknown>,
    children.props,
  );

  return cloneElement(children, {
    ...mergedProps,
    ref: handleRef,
  });
});
