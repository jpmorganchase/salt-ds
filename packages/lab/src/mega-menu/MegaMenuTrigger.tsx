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
import { useMegaMenu } from "./useMegaMenu";
import { FOCUSABLE_SELECTOR, focusFirstItem } from "./useMegaMenuNavigation";

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
      setFocusFirstItemOnOpen,
      floatingRootContext,
      panelId,
    } = megaMenu;

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLElement>) => {
        const { key, shiftKey } = event;

        // ArrowLeft/Right: move to adjacent trigger in nav bar
        if (key === "ArrowRight" || key === "ArrowLeft") {
          event.preventDefault();
          const direction = key === "ArrowRight" ? "next" : "previous";
          const adjacent = getAdjacentTrigger(event.currentTarget, direction);
          if (adjacent) {
            if (openState) setOpen(false);
            setFocusFirstItemOnOpen(false);
            adjacent.focus();
          }
          return;
        }

        // When menu is open: ArrowDown or Tab moves focus into the menu
        if (
          openState &&
          (key === "ArrowDown" || (key === "Tab" && !shiftKey))
        ) {
          event.preventDefault();
          const floating = floatingRootContext.elements
            .floating as HTMLElement | null;
          if (floating) focusFirstItem(floating);
          return;
        }

        // When menu is closed: ArrowDown opens and focuses first item
        if (!openState && key === "ArrowDown") {
          event.preventDefault();
          setFocusFirstItemOnOpen(true);
          setOpen(true);
          return;
        }
      },
      [
        openState,
        setOpen,
        setFocusFirstItemOnOpen,
        floatingRootContext.elements.floating,
      ],
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
