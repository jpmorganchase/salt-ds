import type { FloatingRootContext, useInteractions } from "@floating-ui/react";
import { createContext } from "@salt-ds/core";
import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useContext,
} from "react";

export interface SidePanelContextValue {
  /**
   * Whether the side panel is currently open.
   */
  openState: boolean;
  /**
   * The floating-ui root context shared between the trigger and the panel.
   * Coordinates interactions (click, dismiss, role) across both elements.
   */
  floatingRootContext: FloatingRootContext;
  /**
   * Props getter for the floating (panel) element.
   * Spreads ARIA attributes and event handlers onto the panel.
   */
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
  /**
   * Props getter for the reference (trigger) element.
   * Spreads aria-expanded, aria-controls, click handler, etc. onto the trigger.
   */
  getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
  /**
   * Ref setter for the panel element.
   * Registers the panel DOM node with floating-ui.
   */
  setFloating: Dispatch<SetStateAction<HTMLDivElement | null>>;
  /**
   * Ref setter for the reference (trigger) element.
   * Registers the trigger DOM node with floating-ui for focus return.
   */
  setReference: Dispatch<SetStateAction<HTMLElement | null>>;
  /**
   * Sets the open state of the panel.
   * Called by SidePanelCloseTrigger or any consumer that needs to close the panel.
   */
  setOpen: (open: boolean) => void;
  /**
   * Ref to the close button in panel content used for open-time initial focus.
   */
  closeButtonRef: MutableRefObject<HTMLButtonElement | null>;
  /**
   * Side panel id used for aria-controls on the trigger.
   */
  panelId?: string;
  /**
   * Registers or clears the side panel id used for aria-controls/id linkage.
   */
  setPanelId: Dispatch<SetStateAction<string | undefined>>;
}

export const SidePanelContext = createContext<SidePanelContextValue>(
  "SidePanelContext",
  {
    openState: false,
    floatingRootContext: {} as FloatingRootContext,
    getFloatingProps: () => ({}) as Record<string, unknown>,
    getReferenceProps: () => ({}) as Record<string, unknown>,
    setFloating: () => {},
    setReference: () => {},
    setOpen: () => {},
    closeButtonRef: { current: null },
    panelId: undefined,
    setPanelId: () => {},
  },
);

export function useSidePanelContext() {
  return useContext(SidePanelContext);
}
