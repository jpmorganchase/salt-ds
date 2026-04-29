import {
  getRefFromChildren,
  mergeProps,
  NavigationItem,
  useForkRef,
} from "@salt-ds/core";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
} from "react";
import { MegaMenuContext } from "./MegaMenuContext";
import {
  moveFocusToAdjacentTriggerAndSyncMenuState,
  useMegaMenuTriggerKeyboardNavigation,
} from "./useMegaMenuTriggerKeyboardNavigation";

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
      getReferenceProps,
      setReference,
      setOpen,
      openState,
      setRequestFocusFirstItemOnOpen,
    } = megaMenu;

    const handleMoveToAdjacentTrigger = useCallback(
      (direction: "next" | "previous", currentTarget: HTMLElement) => {
        moveFocusToAdjacentTriggerAndSyncMenuState({
          direction,
          currentTarget,
          isOpen: openState,
          setOpen,
          setRequestFocusFirstItemOnOpen,
        });
      },
      [openState, setOpen, setRequestFocusFirstItemOnOpen],
    );

    const { handleKeyDown } = useMegaMenuTriggerKeyboardNavigation({
      isOpen: openState,
      floating: megaMenu.floatingRootContext.elements
        .floating as HTMLElement | null,
      onOpenMenu: (intent) => {
        setRequestFocusFirstItemOnOpen(intent === "focus-first-item");
        setOpen(true);
      },
      onMoveToAdjacentTrigger: handleMoveToAdjacentTrigger,
    });

    const handleFloatingRef = useForkRef(
      getRefFromChildren(children),
      setReference,
    );
    const handleRef = useForkRef(handleFloatingRef, ref);

    if (!children || !isValidElement<{ ref?: Ref<unknown> }>(children)) {
      return <>{children}</>;
    }

    const childProps = children.props as Record<string, unknown>;
    const isNavigationItemChild = children.type === NavigationItem;
    const shouldSyncExpanded =
      isNavigationItemChild || childProps.expanded !== undefined;

    return cloneElement(children, {
      ...mergeProps(
        getReferenceProps({
          ...(shouldSyncExpanded ? { expanded: openState } : null),
          onKeyDown: handleKeyDown,
          ...rest,
        }),
        children.props,
      ),
      ref: handleRef,
    });
  },
);
