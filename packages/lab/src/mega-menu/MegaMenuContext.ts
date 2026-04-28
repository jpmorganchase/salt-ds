import type {
  ElementProps,
  FloatingRootContext,
  Placement,
} from "@floating-ui/react";
import { createContext } from "@salt-ds/core";
import type { Dispatch, HTMLProps, SetStateAction } from "react";

export interface MegaMenuContextValue {
  openState: boolean;
  floatingRootContext: FloatingRootContext;
  placement: Placement;
  menuRegionId: string;
  getFloatingProps: (
    userProps?: HTMLProps<HTMLElement> | undefined,
  ) => Record<string, unknown>;
  getReferenceProps: (
    userProps?: HTMLProps<Element> | undefined,
  ) => Record<string, unknown>;
  setFloating: Dispatch<SetStateAction<HTMLElement | null>>;
  setReference: Dispatch<SetStateAction<HTMLElement | null>>;
  setOpen: (open: boolean) => void;
  requestFocusFirstItemOnOpen: boolean;
  setRequestFocusFirstItemOnOpen: Dispatch<SetStateAction<boolean>>;
  selectedItem: string | undefined;
  setSelectedItem: Dispatch<SetStateAction<string | undefined>>;
}

export const MegaMenuContext = createContext<MegaMenuContextValue | undefined>(
  "MegaMenuContext",
  undefined,
);

export interface MegaMenuCustomInteractions {
  interactions?: (context: FloatingRootContext) => Array<ElementProps>;
}
