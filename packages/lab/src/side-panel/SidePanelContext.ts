import type { SidePanelContextValue } from "./internal";
import { useSidePanelContext } from "./internal";

type CommonPanelContext = Pick<
  SidePanelContextValue,
  "openState" | "setOpen" | "panelId"
>;

export interface SidePanelValue extends CommonPanelContext {
  /**
   * Props getter for the trigger element.
   * Spread the result onto the element that opens/closes the panel.
   * Accepts optional user props (event handlers, aria attributes, etc.)
   * which are merged with the internal interaction props.
   */
  getTriggerProps: (
    userProps?: Record<string, unknown>,
  ) => Record<string, unknown>;
  /**
   * Ref callback to attach to the trigger element.
   * Registers the DOM node so the panel can return focus on close.
   */
  triggerRef: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}

export function useSidePanel(): SidePanelValue {
  const { openState, setOpen, getReferenceProps, setReference, panelId } =
    useSidePanelContext();
  return {
    openState,
    setOpen,
    getTriggerProps: getReferenceProps as (
      userProps?: Record<string, unknown>,
    ) => Record<string, unknown>,
    triggerRef: setReference,
    panelId,
  };
}
