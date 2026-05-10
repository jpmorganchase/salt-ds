import {
  type Placement,
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";
import { useControlled } from "@salt-ds/core";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { MegaMenuContext } from "./MegaMenuContext";
import { useMegaMenuKeyboard } from "./useMegaMenuKeyboard";

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
  placement?: Placement;
}

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
  const [focusFirstItemOnOpen, setFocusFirstItemOnOpen] = useState(false);
  const [panelId, setPanelId] = useState<string | undefined>(undefined);

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setFocusFirstItemOnOpen(false);
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

  const megaMenuKeyboard = useMegaMenuKeyboard(floatingRootContext);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(floatingRootContext),
    useDismiss(floatingRootContext),
    megaMenuKeyboard,
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
      focusFirstItemOnOpen,
      setFocusFirstItemOnOpen,
      panelId,
      setPanelId,
    }),
    [
      openState,
      floatingRootContext,
      placement,
      getFloatingProps,
      getReferenceProps,
      setFloating,
      setReference,
      setOpen,
      focusFirstItemOnOpen,
      setFocusFirstItemOnOpen,
      panelId,
      setPanelId,
    ],
  );

  return (
    <MegaMenuContext.Provider value={contextValue}>
      {children}
    </MegaMenuContext.Provider>
  );
}
