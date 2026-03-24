import { createContext, type MutableRefObject } from "react";

export interface SidePanelGroupContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  panelId?: string;
  activeTriggerId?: string;
  setActiveTriggerId: (triggerId: string | undefined) => void;
  triggerRef?: MutableRefObject<HTMLElement | null>;
  setTriggerRef: (
    triggerRef: MutableRefObject<HTMLElement | null> | undefined,
  ) => void;
  /**
   * Atomically activate a trigger: sets active trigger ID, keeps panel open,
   * and registers the trigger's ref for focus management.
   */
  activateTrigger: (
    triggerId: string,
    triggerElement: MutableRefObject<HTMLElement | null>,
  ) => void;
}

export const SidePanelGroupContext =
  createContext<SidePanelGroupContextValue | null>(null);
