import type { FloatingRootContext } from "@floating-ui/react";
import { createContext } from "@salt-ds/core";
import { type Dispatch, type SetStateAction, useContext } from "react";

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
   * Called by the close button in SidePanelHeader, or any consumer that needs to close the panel.
   */
  setOpen: (open: boolean) => void;
  /**
   * Side panel id used for aria-controls on the trigger.
   */
  panelId?: string;
  /**
   * Registers or clears the side panel id used for aria-controls/id linkage.
   */
  setPanelId: Dispatch<SetStateAction<string | undefined>>;
  /**
   * The auto-generated id placed on SidePanelTitle.
   * Used for aria-labelledby on the panel region and the scrollable body.
   */
  titleId?: string;
  /**
   * Registers the title id from SidePanelTitle back to the context
   * so that SidePanel and SidePanelContent can use it for aria-labelledby.
   */
  setTitleId: Dispatch<SetStateAction<string | undefined>>;
}

export const SidePanelContext = createContext<SidePanelContextValue>(
  "SidePanelContext",
  {
    openState: false,
    floatingRootContext: {} as FloatingRootContext,
    setFloating: () => {},
    setReference: () => {},
    setOpen: () => {},
    panelId: undefined,
    setPanelId: () => {},
    titleId: undefined,
    setTitleId: () => {},
  },
);

export function useSidePanelContext() {
  return useContext(SidePanelContext);
}
