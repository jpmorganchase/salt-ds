import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
  type Ref,
} from "react";
import { getRefFromChildren, mergeProps, useForkRef } from "../utils";
import { useOverlayContext } from "./OverlayContext";

export interface OverlayTriggerProps {
  children?: ReactNode;
}

export const OverlayTrigger = forwardRef<HTMLElement, OverlayTriggerProps>(
  function OverlayTrigger(props, ref) {
    const { children, ...rest } = props;

    const { reference, getReferenceProps } = useOverlayContext();

    const handleFloatingRef = useForkRef(
      getRefFromChildren(children),
      reference,
    );
    const handleRef = useForkRef(handleFloatingRef, ref);

    if (!children || !isValidElement<{ ref?: Ref<unknown> }>(children)) {
      return <>{children}</>;
    }

    return (
      <>
        {cloneElement(children, {
          ...mergeProps(getReferenceProps(rest), children.props),
          ref: handleRef,
        })}
      </>
    );
  },
);
