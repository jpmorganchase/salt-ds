import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface MegaMenuGroupContextValue {
  /**
   * The id of the group's `MegaMenuGroupHeading`. The heading wears it and the
   * `MegaMenuItemList` references it via `aria-labelledby`, so the association is
   * wired through context rather than by inspecting children.
   */
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
