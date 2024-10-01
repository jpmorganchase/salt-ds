import { createContext } from "@salt-ds/core";
import { type SyntheticEvent, useContext } from "react";

export interface TabListNextContextValue {
  variant: "main" | "inline";
  handleClose: (event: SyntheticEvent, id: string) => void;
}

export const TabListNextContext = createContext<TabListNextContextValue>(
  "TabListNextContext",
  {
    variant: "main",
    handleClose: () => undefined,
  },
);

export function useTabListNext() {
  return useContext(TabListNextContext);
}
