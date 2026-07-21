import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
} from "react";
import { getRefFromChildren, mergeProps, useForkRef } from "../utils";
import { useSidePanelContext } from "./internal";

export type SidePanelTriggerProps = ComponentPropsWithoutRef<"button">;

export const SidePanelTrigger = forwardRef<
  HTMLButtonElement,
  SidePanelTriggerProps
>(function SidePanelTrigger(props, ref) {
  const { children, onClick, ...rest } = props;
  const { setReference, openState, setOpen, panelId } = useSidePanelContext();

  const combinedRef = useForkRef(setReference, ref);
  const handleRef = useForkRef(combinedRef, getRefFromChildren(children));

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
      onClick: handleClick,
      ...rest,
    },
    children.props,
  );

  return cloneElement(children, {
    ...mergedProps,
    ref: handleRef,
  });
});
