import { createContext } from "@salt-ds/core";
import { type MutableRefObject, useContext } from "react";

export interface SidePanelGroupContextValue {
  /**
   * Whether the side panel is currently open.
   */
  open?: boolean;
  /**
   * Function to set the open state of the panel.
   */
  setOpen?: (open: boolean) => void;
  /**
   * ID of the panel.
   */
  panelId?: string;
  /**
   * DOM reference of the active trigger, used to restore focus when the panel closes and
   * to identify which trigger is active (compared against each trigger's own ref).
   */
  triggerRef?: MutableRefObject<HTMLElement | null>;
  /**
   * Activates a trigger: sets its ref, keeps the panel open, and prepares for focus restoration on close.
   */
  activateTrigger: (
    triggerElement: MutableRefObject<HTMLElement | null>,
  ) => void;
  /**
   * Counter incremented on each trigger activation; used to drive focus movement into panel.
   */
  activationCount?: number;
}

export const SidePanelGroupContext = createContext<SidePanelGroupContextValue>(
  "SidePanelGroupContext",
  {
    open: undefined,
    setOpen: undefined,
    activateTrigger: () => undefined,
  },
);

export function useSidePanelGroup() {
  return useContext(SidePanelGroupContext);
}
