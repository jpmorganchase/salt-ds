import { getRefFromChildren, mergeProps, useForkRef } from "@salt-ds/core";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
  type Ref,
  useContext,
} from "react";
import { MegaMenuContext } from "./MegaMenuContext";

export interface MegaMenuTriggerProps {
  children?: ReactNode;
}

export const MegaMenuTrigger = forwardRef<HTMLElement, MegaMenuTriggerProps>(
  function MegaMenuTrigger(props, ref) {
    const { children, ...rest } = props;
    const megaMenu = useContext(MegaMenuContext);

    if (!megaMenu) {
      throw new Error("MegaMenuTrigger must be used within a MegaMenu");
    }

    const { getReferenceProps, setReference, setOpen } = megaMenu;

    const handleFloatingRef = useForkRef(
      getRefFromChildren(children),
      setReference,
    );
    const handleRef = useForkRef(handleFloatingRef, ref);

    if (!children || !isValidElement<{ ref?: Ref<unknown> }>(children)) {
      return <>{children}</>;
    }

    return cloneElement(children, {
      ...mergeProps(
        getReferenceProps({
          onClick: (event) => {
            setReference(event.currentTarget as HTMLElement);
            setOpen(true);
          },
          ...rest,
        }),
        children.props,
      ),
      ref: handleRef,
    });
  },
);
