import {
  type ButtonProps,
  getRefFromChildren,
  mergeProps,
  useForkRef,
} from "@salt-ds/core";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
} from "react";
import { useSidePanelGroup } from "./SidePanelGroupContext";

export interface SidePanelCloseButtonProps extends ButtonProps {
  children: ReactNode;
}

export const SidePanelCloseTrigger = forwardRef<
  HTMLElement,
  SidePanelCloseButtonProps
>(function SidePanelCloseTrigger({ children, onClick, ...rest }, ref) {
  const { setOpen } = useSidePanelGroup();

  const handleClick: ButtonProps["onClick"] = (event) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    setOpen?.(false);
  };

  const handleRef = useForkRef(getRefFromChildren(children), ref);

  if (!children || !isValidElement(children)) {
    return <>{children}</>;
  }

  const mergedProps = mergeProps(
    {
      onClick: handleClick,
      ...rest,
    },
    children.props,
  );

  return (
    <>
      {cloneElement(children, {
        ...mergedProps,
        ref: handleRef,
      })}
    </>
  );
});
