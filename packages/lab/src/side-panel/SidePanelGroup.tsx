import { useControlled, useId } from "@salt-ds/core";
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  SidePanelGroupContext,
  type SidePanelGroupContextValue,
} from "./SidePanelGroupContext";

export interface SidePanelGroupProps {
  /**
   * Whether the panel is open
   */
  open?: boolean;
  /**
   * Default open state when initially rendered
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state should change
   */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function SidePanelGroup(props: SidePanelGroupProps) {
  const { children, open: openProp, defaultOpen, onOpenChange } = props;

  const [open, setOpenState] = useControlled({
    default: Boolean(defaultOpen),
    controlled: openProp,
    name: "SidePanelGroup",
    state: "open",
  });

  const panelId = useId();
  const [activeTriggerId, setActiveTriggerId] = useState<string | undefined>(
    undefined,
  );
  const [triggerRef, setTriggerRef] = useState<
    MutableRefObject<HTMLElement | null> | undefined
  >(undefined);

  const setOpen = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      if (!newOpen) {
        setActiveTriggerId(undefined);
      }
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const activateTrigger = useCallback(
    (
      triggerId: string,
      triggerElement: MutableRefObject<HTMLElement | null>,
    ) => {
      setActiveTriggerId(triggerId);
      setTriggerRef(triggerElement);
      if (!open) {
        setOpenState(true);
        onOpenChange?.(true);
      }
    },
    [open, onOpenChange],
  );

  const contextValue = useMemo<SidePanelGroupContextValue>(
    () => ({
      open,
      setOpen,
      panelId,
      activeTriggerId,
      triggerRef,
      activateTrigger,
    }),
    [open, setOpen, panelId, activeTriggerId, triggerRef, activateTrigger],
  );

  return (
    <SidePanelGroupContext.Provider value={contextValue}>
      {children}
    </SidePanelGroupContext.Provider>
  );
}
