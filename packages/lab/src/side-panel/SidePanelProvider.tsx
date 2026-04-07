import {
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useControlled, useId } from "@salt-ds/core";
import { type ReactNode, useState } from "react";
import { SidePanelContext } from "./SidePanelContext";

export interface SidePanelGroupProps {
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Default open state when initially rendered.
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * SidePanelProvider children, should include SidePanel and SidePanelTrigger.
   */
  children: ReactNode;
}

export function SidePanelProvider(props: SidePanelGroupProps) {
  const { children, open: openProp, defaultOpen, onOpenChange } = props;

  const [openState, setOpenState] = useControlled({
    default: Boolean(defaultOpen),
    controlled: openProp,
    name: "SidePanelProvider",
    state: "open",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpenState(newOpen);
    onOpenChange?.(newOpen);
  };

  const [reference, setReference] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);
  const panelId = useId();

  const floatingRootContext = useFloatingRootContext({
    open: openState,
    onOpenChange: handleOpenChange,
    elements: {
      reference,
      floating,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useRole(floatingRootContext, { role: "dialog" }),
    useClick(floatingRootContext),
    useDismiss(floatingRootContext, { escapeKey: true, outsidePress: false }),
  ]);

  return (
    <SidePanelContext.Provider
      value={{
        openState,
        floatingRootContext,
        getFloatingProps,
        getReferenceProps,
        setFloating,
        setReference,
        setOpen: handleOpenChange,
        panelId,
      }}
    >
      {children}
    </SidePanelContext.Provider>
  );
}
