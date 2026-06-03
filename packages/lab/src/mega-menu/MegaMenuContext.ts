import type { FloatingRootContext, Placement } from "@floating-ui/react";
import { createContext } from "@salt-ds/core";
import type { Dispatch, HTMLProps, SetStateAction } from "react";

export interface MegaMenuContextValue {
  /** Whether the mega menu is currently open. */
  openState: boolean;
  /** Toggle or set the open state of the mega menu. */
  setOpen: (open: boolean) => void;
  /** The floating-ui root context for coordinating interactions. */
  floatingRootContext: FloatingRootContext;
  /** The placement of the mega menu panel relative to the trigger. */
  placement: Placement;
  /** Props getter for the trigger (reference) element. Merges floating-ui interaction props with user props. */
  getReferenceProps: (
    userProps?: HTMLProps<Element> | undefined,
  ) => Record<string, unknown>;
  /** Props getter for the floating panel element. Merges floating-ui interaction props with user props. */
  getFloatingProps: (
    userProps?: HTMLProps<HTMLElement> | undefined,
  ) => Record<string, unknown>;
  /** Ref setter for the floating panel element. */
  setFloating: Dispatch<SetStateAction<HTMLElement | null>>;
  /** Ref setter for the trigger (reference) element. */
  setReference: Dispatch<SetStateAction<HTMLElement | null>>;
  /** The id of the mega menu panel, used for aria-controls on the trigger. */
  panelId: string | undefined;
}

export const MegaMenuContext = createContext<MegaMenuContextValue | undefined>(
  "MegaMenuContext",
  undefined,
);
