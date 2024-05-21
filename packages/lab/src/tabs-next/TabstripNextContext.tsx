import { createContext } from "@salt-ds/core";
import { type SyntheticEvent, useContext } from "react";

interface TabValue {
  id: string;
  element: HTMLElement;
}

export interface TabstripNextContextValue {
  registerItem: (tab: TabValue) => void;
  variant: "main" | "inline";
  setSelected: (event: SyntheticEvent, id: string) => void;
  setActive: (id: string) => void;
  handleClose: (event: SyntheticEvent, id: string) => void;
  selected?: string;
  focusInside: boolean;
}

export const TabstripNextContext = createContext<TabstripNextContextValue>(
  "TabstripNextContext",
  {
    registerItem: () => undefined,
    variant: "main",
    setSelected: () => undefined,
    setActive: () => undefined,
    handleClose: () => undefined,
    selected: undefined,
    focusInside: false,
  },
);

export function useTabstripNext() {
  return useContext(TabstripNextContext);
}
