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

const getAdjacentTrigger = (
  currentTarget: HTMLElement,
  direction: "next" | "previous",
): HTMLElement | null => {
  const triggerListItem = currentTarget.closest("li");
  if (!triggerListItem) return null;

  const sibling =
    direction === "next"
      ? triggerListItem.nextElementSibling
      : triggerListItem.previousElementSibling;

  if (!(sibling instanceof HTMLElement)) return null;

  return sibling.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
};

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

    const {
      menuRegionId,
      getReferenceProps,
      setReference,
      setOpen,
      openState,
      setRequestFocusFirstItemOnOpen,
    } = megaMenu;

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      const currentTarget = event.currentTarget;
      const isEnter = event.key === "Enter";
      const isSpace = event.key === " ";
      const isArrowDown = event.key === "ArrowDown";
      const isArrowRight = event.key === "ArrowRight";
      const isArrowLeft = event.key === "ArrowLeft";
      const isTab = event.key === "Tab" && !event.shiftKey;
      const focusFirstItem = () => {
        const floating = megaMenu.floatingRootContext.elements
          .floating as HTMLElement | null;
        const firstFocusable =
          floating?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        if (firstFocusable) {
          firstFocusable.focus();
          return true;
        }
        return false;
      };

      // Move focus horizontally between sibling triggers using arrow keys.
      if (isArrowRight || isArrowLeft) {
        const adjacentTrigger = getAdjacentTrigger(
          currentTarget,
          isArrowRight ? "next" : "previous",
        );

        if (adjacentTrigger) {
          event.preventDefault();
          if (openState) {
            setOpen(false);
          }
          setRequestFocusFirstItemOnOpen(false);
          adjacentTrigger.focus();
        }
        return;
      }

      // Open menu on Enter or Spacebar when collapsed
      if ((isEnter || isSpace) && !openState) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      // Open menu and place focus on first item when pressing Down arrow on collapsed trigger
      if (isArrowDown && !openState) {
        event.preventDefault();
        setRequestFocusFirstItemOnOpen(true);
        setOpen(true);
        return;
      }

      // Tab to first focusable item inside menu when already open
      if (isTab && openState) {
        if (focusFirstItem()) {
          event.preventDefault();
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
          role: "button",
          "aria-expanded": openState,
          "aria-controls": menuRegionId,
          onKeyDown: handleKeyDown,
          ...rest,
        }),
        children.props,
      ),
      ref: handleRef,
    });
  },
);
