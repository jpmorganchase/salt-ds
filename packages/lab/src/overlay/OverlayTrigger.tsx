import { cloneElement, isValidElement, ReactNode } from "react";
import { mergeProps, useForkRef } from "@salt-ds/core";
import { useOverlayContext } from "./OverlayContext";

export interface OverlayTriggerProps {
  children?: ReactNode;
}

export function OverlayTrigger(props: OverlayTriggerProps) {
  const { children } = props;

  const { reference, getReferenceProps, id } = useOverlayContext();

  const triggerRef = useForkRef(
    // @ts-ignore error TS2339 missing property ref
    isValidElement(children) ? children.ref : null,
    reference
  );

  if (!children || !isValidElement(children)) {
    return <>{children}</>;
  }

  const getTriggerProps = () =>
    getReferenceProps({
      ref: reference,
      id: `${id}-trigger`,
      "aria-controls": `${id}-panel`,
    });

  return (
    <>
      {cloneElement(children, {
        ...mergeProps(getTriggerProps(), children.props),
        ref: triggerRef,
      })}
    </>
  );
}
