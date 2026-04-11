import { createContext } from "@salt-ds/core";
import { type MutableRefObject, useContext } from "react";

export interface SidePanelContextValue {
  /**
   * Whether the side panel is currently open.
   */
  openState?: boolean;
  /**
   * Function to set the open state of the panel.
   */
  setOpen: (open: boolean) => void;
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
  /**
   * Returns props to spread onto the floating panel element (e.g. `{ id }`).
   * For use when building a custom trigger outside of `SidePanelTrigger`.
   */
  getFloatingProps: () => { id?: string };
  /**
   * Returns merged props for the trigger element, including aria-expanded and aria-controls.
   * For use when building a custom trigger outside of `SidePanelTrigger`.
   */
  getReferenceProps: (
    props?: Record<string, unknown>,
  ) => Record<string, unknown>;
  /**
   * Registers the trigger DOM element for focus return when the panel closes.
   * For use when building a custom trigger outside of `SidePanelTrigger`.
   */
  setReference: (el: HTMLElement | null) => void;
}

export const SidePanelContext = createContext<SidePanelContextValue>(
  "SidePanelContext",
  {
    openState: undefined,
    setOpen: () => undefined,
    activateTrigger: () => undefined,
    getFloatingProps: () => ({}),
    getReferenceProps: (props) => ({ ...props }),
    setReference: () => undefined,
  },
);

export function useSidePanelContext() {
  return useContext(SidePanelContext);
}
