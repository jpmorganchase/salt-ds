import { createContext } from "@salt-ds/core";

export interface MegaMenuGroupContextValue {
  /** The id assigned to the group's header, used to label the group's list. */
  headerId: string | undefined;
}

export const MegaMenuGroupContext = createContext<
  MegaMenuGroupContextValue | undefined
>("MegaMenuGroupContext", undefined);
