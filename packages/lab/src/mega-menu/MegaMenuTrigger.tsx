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
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
} from "react";
import { firstFocusable, getAdjacentTrigger } from "./megaMenuNavigation";
import { useMegaMenu } from "./useMegaMenu";

export interface MegaMenuTriggerProps {
  /**
   * The trigger element for the mega menu, typically a `NavigationItem` or `Button`.
   */
  children?: ReactNode;
}

export const MegaMenuTrigger = forwardRef<HTMLElement, MegaMenuTriggerProps>(
  function MegaMenuTrigger(props, ref) {
    const { children, ...rest } = props;
    const megaMenu = useMegaMenu();

    const {
      getReferenceProps,
      setReference,
      setOpen,
      openState,
      panelId,
      floatingRootContext,
      openWithFirstItemFocus,
    } = megaMenu;

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLElement>) => {
        const { key } = event;

        // ArrowLeft/Right: move to adjacent trigger in nav bar
        if (key === "ArrowRight" || key === "ArrowLeft") {
          event.preventDefault();
          const direction = key === "ArrowRight" ? "next" : "previous";
          const adjacent = getAdjacentTrigger(event.currentTarget, direction);
          if (adjacent) {
            if (openState) setOpen(false);
            adjacent.focus();
          }
          return;
        }

        if (key === "ArrowDown") {
          event.preventDefault();
          if (openState) {
            // Menu already open (e.g. opened by click): move focus into the
            // first item of the first column.
            const panel = floatingRootContext.elements
              .floating as HTMLElement | null;
            if (panel) firstFocusable(panel)?.focus();
          } else {
            // Menu closed: open AND focus the first item in one press.
            openWithFirstItemFocus();
          }
        }
      },
      [openState, setOpen, floatingRootContext, openWithFirstItemFocus],
    );

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
          // For NavigationItem, sync via the `expanded` prop (which maps to aria-expanded internally).
          // For all other elements, set aria-expanded directly.
          ...(shouldSyncExpanded
            ? { expanded: openState }
            : { "aria-expanded": openState }),
          ...(panelId && openState ? { "aria-controls": panelId } : null),
          onKeyDown: handleKeyDown,
          ...rest,
        }),
        children.props,
      ),
      ref: handleRef,
    });
  },
);
