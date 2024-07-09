import { type ReactNode, cloneElement, isValidElement } from "react";
import { getRefFromChildren, mergeProps, useForkRef } from "../utils";
import { useOverlayContext } from "./OverlayContext";

export interface OverlayTriggerProps {
  children?: ReactNode;
}

export function OverlayTrigger(props: OverlayTriggerProps) {
  const { children } = props;

  const { reference, getReferenceProps } = useOverlayContext();

  const triggerRef = useForkRef(getRefFromChildren(children), reference);

  if (!children || !isValidElement(children)) {
    return <>{children}</>;
  }

  return (
    <>
      {cloneElement(children, {
        ...mergeProps(getReferenceProps(), children.props),
        ref: triggerRef,
      })}
    </>
  );
}
