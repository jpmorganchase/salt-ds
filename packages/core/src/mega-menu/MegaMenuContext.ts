import type { FloatingRootContext } from "@floating-ui/react";
import type {
  Dispatch,
  HTMLProps,
  MutableRefObject,
  SetStateAction,
} from "react";
import { createContext } from "../utils";
import type { MegaMenuPlacement } from "./MegaMenu";

export interface MegaMenuContextValue {
  /** Whether the mega menu is currently open. */
  openState: boolean;
  /** Toggle or set the open state of the mega menu. */
  setOpen: (open: boolean) => void;
  /** The floating-ui root context for coordinating interactions. */
  floatingRootContext: FloatingRootContext;
  /** The placement of the mega menu panel relative to the trigger. */
  placement: MegaMenuPlacement;
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
  /** Whether the first item should receive focus when the panel opens. */
  focusFirstItemOnOpenRef: MutableRefObject<boolean>;
  /** The id of the mega menu panel, used for aria-controls on the trigger. */
  panelId: string | undefined;
  /** Registers the panel's id so the trigger's aria-controls stays in sync. */
  setPanelId: Dispatch<SetStateAction<string | undefined>>;
}

export const MegaMenuContext = createContext<MegaMenuContextValue | undefined>(
  "MegaMenuContext",
  undefined,
);
