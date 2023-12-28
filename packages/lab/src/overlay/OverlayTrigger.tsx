import { cloneElement, isValidElement, ReactNode, MouseEvent } from "react";
import { mergeProps, useForkRef } from "@salt-ds/core";
import { useOverlayContext } from "./OverlayContext";

export interface OverlayTriggerProps {
  children?: ReactNode;
}

export function OverlayTrigger(props: OverlayTriggerProps) {
  const { children } = props;

  const { setOpen, reference, getReferenceProps } = useOverlayContext();

  const triggerRef = useForkRef(
    // @ts-ignore error TS2339 missing property ref
    isValidElement(children) ? children.ref : null,
    reference
  );

  if (!children || !isValidElement(children)) {
    return <>{children}</>;
  }

  const handleClick = (event: MouseEvent) => {
    setOpen(event, true);
  };

  const getTriggerProps = () =>
    getReferenceProps({
      ref: reference,
      onClick: handleClick,
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
