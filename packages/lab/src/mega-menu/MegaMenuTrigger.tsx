import { getRefFromChildren, mergeProps, useForkRef } from "@salt-ds/core";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useContext,
} from "react";
import { MegaMenuContext } from "./MegaMenuContext";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

    const { getReferenceProps, setReference, setOpen, openState } = megaMenu;

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Tab" && !event.shiftKey && openState) {
        const floating = megaMenu.floatingRootContext.elements
          .floating as HTMLElement | null;
        if (floating) {
          const firstFocusable =
            floating.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          if (firstFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

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
          onKeyDown: handleKeyDown,
          ...rest,
        }),
        children.props,
      ),
      ref: handleRef,
    });
  },
);
