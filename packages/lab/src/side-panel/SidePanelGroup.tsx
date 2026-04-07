import { useControlled, useId } from "@salt-ds/core";
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
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
  /**
   * SidePanelGroup children, should include SidePanel and SidePanelTrigger
   */
  children: ReactNode;
}

export function SidePanelGroup(props: SidePanelGroupProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [activationCount, setActivationCount] = useState(0);

  const { children, open: openProp, defaultOpen, onOpenChange } = props;

  const [open, setOpenState] = useControlled({
    default: Boolean(defaultOpen),
    controlled: openProp,
    name: "SidePanelGroup",
    state: "open",
  });

  const panelId = useId();

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (newOpen === open) {
        return;
      }

      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [open, onOpenChange, setOpenState],
  );

  const activateTrigger = useCallback(
    (triggerElement: MutableRefObject<HTMLElement | null>) => {
      triggerRef.current = triggerElement.current;
      setActivationCount((count) => count + 1);
      setOpen(true);
    },
    [setOpen],
  );

  const contextValue = useMemo<SidePanelGroupContextValue>(
    () => ({
      open,
      setOpen,
      panelId,
      triggerRef,
      activateTrigger,
      activationCount,
    }),
    [open, setOpen, panelId, activateTrigger, activationCount],
  );

  return (
    <SidePanelGroupContext.Provider value={contextValue}>
      {children}
    </SidePanelGroupContext.Provider>
  );
}
