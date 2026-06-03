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
import { FOCUSABLE_SELECTOR, useMegaMenuGrid } from "./MegaMenuGridContext";
import { useMegaMenu } from "./useMegaMenu";

export interface MegaMenuTriggerProps {
  /**
   * The trigger element for the mega menu, typically a `NavigationItem` or `Button`.
   */
  children?: ReactNode;
}

function getAdjacentTrigger(
  currentTarget: HTMLElement,
  direction: "next" | "previous",
): HTMLElement | null {
  const li = currentTarget.closest("li");
  if (!li) return null;
  const sibling =
    direction === "next" ? li.nextElementSibling : li.previousElementSibling;
  if (!(sibling instanceof HTMLElement)) return null;
  return sibling.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
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
      focusFirstOnOpenRef,
    } = megaMenu;
    const grid = useMegaMenuGrid();

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
            // first navigable item, resolved from the registration model.
            grid?.getModel()[0]?.[0]?.focus();
          } else {
            // Menu closed: open AND focus the first item in one press. The ref
            // is set synchronously so the panel's `initialFocus` reads it on
            // mount (FFM resolves index 0 from DOM tabbable order).
            focusFirstOnOpenRef.current = true;
            setOpen(true);
          }
        }
      },
      [openState, setOpen, grid, focusFirstOnOpenRef],
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
