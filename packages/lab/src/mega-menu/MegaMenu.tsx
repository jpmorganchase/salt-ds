import {
  type Placement,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
} from "@floating-ui/react";
import { useControlled } from "@salt-ds/core";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
  MegaMenuContext,
  type MegaMenuCustomInteractions,
} from "./MegaMenuContext";

export interface MegaMenuProps extends MegaMenuCustomInteractions {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
}

export const MegaMenu = ({
  children,
  open,
  onOpenChange,
  placement = "bottom",
  interactions,
}: MegaMenuProps) => {
  const [openState, setOpenState] = useControlled({
    controlled: open,
    default: false,
    name: "MegaMenu",
    state: "open",
  });

  const [reference, setReference] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined,
  );

  const setOpen = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: setOpen,
    elements: {
      reference,
      floating,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions(
    interactions
      ? interactions(floatingRootContext)
      : [
          // biome-ignore lint/correctness/useHookAtTopLevel: useDismiss is not a React hook
          useDismiss(floatingRootContext, { bubbles: true }),
        ],
  );

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
      selectedItem,
      setSelectedItem,
    }),
    [
      openState,
      floatingRootContext,
      placement,
      getFloatingProps,
      getReferenceProps,
      setOpen,
      selectedItem,
    ],
  );

  return (
    <MegaMenuContext.Provider value={contextValue}>
      {children}
    </MegaMenuContext.Provider>
  );
};
