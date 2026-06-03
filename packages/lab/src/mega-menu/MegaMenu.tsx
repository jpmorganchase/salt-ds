import {
  type Placement,
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";
import { useControlled, useId } from "@salt-ds/core";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { MegaMenuContext } from "./MegaMenuContext";
import {
  MegaMenuGridProvider,
  useMegaMenuGridRegistry,
} from "./MegaMenuGridContext";
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
  const panelId = useId();

  // Transient "open + focus the first item" intent, set synchronously by the
  // trigger's ArrowDown-from-closed handler and read by the panel's
  // `initialFocus`. A ref (not state) so it causes no extra render and keeps
  // focus-on-open off the render path. Reset on close so a later click-open
  // does not steal focus into the panel.
  const focusFirstOnOpenRef = useRef(false);

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        focusFirstOnOpenRef.current = false;
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

  // Document-position registration store. Created here (above the panel) so the
  // keyboard handler can read the model, while columns/items register below.
  const grid = useMegaMenuGridRegistry();
  const megaMenuKeyboard = useMegaMenuKeyboard(
    floatingRootContext,
    grid.getModel,
  );

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
      panelId,
      focusFirstOnOpenRef,
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
      panelId,
    ],
  );

  return (
    <MegaMenuContext.Provider value={contextValue}>
      <MegaMenuGridProvider value={grid}>{children}</MegaMenuGridProvider>
    </MegaMenuContext.Provider>
  );
}
