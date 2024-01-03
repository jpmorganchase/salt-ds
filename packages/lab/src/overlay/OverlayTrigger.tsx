import { ReactNode, MouseEvent, ComponentPropsWithoutRef } from "react";
import { Button } from "@salt-ds/core";
import { useOverlayContext } from "./OverlayContext";

export interface OverlayTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

export function OverlayTrigger(props: OverlayTriggerProps) {
  const { children, ...rest } = props;

  const { setOpen, reference, getReferenceProps } = useOverlayContext();

  const handleClick = (event: MouseEvent) => {
    setOpen(event, true);
  };

  const getTriggerProps = () =>
    getReferenceProps({
      ref: reference,
      onClick: handleClick,
    });

  return (
    <Button {...getTriggerProps()} {...rest}>
      {children}
    </Button>
  );
}
