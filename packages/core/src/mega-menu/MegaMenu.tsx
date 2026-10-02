import {
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { useControlled } from "../utils";
import { MegaMenuContext } from "./MegaMenuContext";
import { useMegaMenuNavigation } from "./useMegaMenuNavigation";

/**
 * Supported placements for the mega menu panel.
 */
export type MegaMenuPlacement = "bottom" | "bottom-start" | "bottom-end";

export interface MegaMenuProps {
  /**
   * The content of the mega menu, typically `MegaMenuTrigger` and `MegaMenuPanel`.
   */
  children?: ReactNode;
  /**
   * Whether the mega menu is open. Use for controlled mode.
   */
  open?: boolean;
  /**
   * Whether the mega menu is initially open. Use for uncontrolled mode.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The placement of the mega menu panel relative to the trigger.
   * @default "bottom"
   */
  placement?: MegaMenuPlacement;
}

/**
 * Root of a mega menu, coordinating its trigger and panel.
 *
 * Not intended to be nested inside another floating overlay (e.g. a dialog or
 * popover): the mega menu does not participate in floating-ui's `FloatingTree`
 */
export function MegaMenu({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
}: MegaMenuProps) {
  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: defaultOpen,
    name: "MegaMenu",
    state: "open",
  });

  const [reference, setReference] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const focusFirstItemOnOpenRef = useRef(false);
  const [panelId, setPanelId] = useState<string>();

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        focusFirstItemOnOpenRef.current = false;
      }
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: setOpen,
    elements: { reference, floating },
  });

  const megaMenuNavigation = useMegaMenuNavigation(floatingRootContext);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(floatingRootContext),
    useDismiss(floatingRootContext),
    megaMenuNavigation,
  ]);

  const contextValue = useMemo(
    () => ({
      openState,
      floatingRootContext,
      placement,
      getFloatingProps,
      getReferenceProps,
      setFloating,
      setReference,
      setOpen,
      focusFirstItemOnOpenRef,
      panelId,
      setPanelId,
    }),
    [
      openState,
      floatingRootContext,
      placement,
      getFloatingProps,
      getReferenceProps,
      setOpen,
      panelId,
    ],
  );

  return (
    <MegaMenuContext.Provider value={contextValue}>
      {children}
    </MegaMenuContext.Provider>
  );
}
