import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface MegaMenuGroupContextValue {
  /** The group heading's id, used to label the item list via `aria-labelledby`. */
  headingId: string | undefined;
}

export const MegaMenuGroupContext = createContext<
  MegaMenuGroupContextValue | undefined
>("MegaMenuGroupContext", undefined);

/**
 * Access the nearest `MegaMenuGroup` context. Returns `undefined` when used
 * outside a group.
 */
export function useMegaMenuGroup(): MegaMenuGroupContextValue | undefined {
  return useContext(MegaMenuGroupContext);
}
