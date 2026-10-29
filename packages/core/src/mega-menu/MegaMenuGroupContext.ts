import { useContext } from "react";
import { createContext } from "../utils";

export interface MegaMenuGroupContextValue {
  /**
   * The rendered heading's id, used to label the item list via `aria-labelledby`.
   * `undefined` when the group has no `MegaMenuGroupHeading`.
   */
  headingId: string | undefined;
  /** Register (or clear, with `undefined`) the heading's id. */
  setHeadingId: (id: string | undefined) => void;
}

export const MegaMenuGroupContext = createContext<MegaMenuGroupContextValue>(
  "MegaMenuGroupContext",
  { headingId: undefined, setHeadingId: () => {} },
);

/** Access the nearest `MegaMenuGroup` context. */
export function useMegaMenuGroup(): MegaMenuGroupContextValue {
  return useContext(MegaMenuGroupContext);
}
