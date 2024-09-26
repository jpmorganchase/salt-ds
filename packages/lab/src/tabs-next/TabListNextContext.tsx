import { createContext } from "@salt-ds/core";
import { type SyntheticEvent, useContext } from "react";

interface TabValue {
  id: string;
  element: HTMLElement;
}

export interface TabListNextContextValue {
  registerItem: (tab: TabValue) => void;
  variant: "main" | "inline";
  handleClose: (event: SyntheticEvent, id: string) => void;
  focusInside: boolean;
}

export const TabListNextContext = createContext<TabListNextContextValue>(
  "TabListNextContext",
  {
    registerItem: () => undefined,
    variant: "main",
    handleClose: () => undefined,
    focusInside: false,
  },
);

export function useTabListNext() {
  return useContext(TabListNextContext);
}
