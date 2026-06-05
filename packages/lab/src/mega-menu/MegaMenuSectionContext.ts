import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface MegaMenuSectionContextValue {
  /**
   * The id of the section's `MegaMenuHeading`. The heading wears it and the
   * `MegaMenuList` references it via `aria-labelledby`, so the association is
   * wired through context rather than by inspecting children.
   */
  headingId: string | undefined;
}

export const MegaMenuSectionContext = createContext<
  MegaMenuSectionContextValue | undefined
>("MegaMenuSectionContext", undefined);

/**
 * Access the nearest `MegaMenuSection` context. Returns `undefined` when used
 * outside a section.
 */
export function useMegaMenuSection(): MegaMenuSectionContextValue | undefined {
  return useContext(MegaMenuSectionContext);
}
