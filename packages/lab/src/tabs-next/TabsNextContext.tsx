import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface TabsNextContextValue {
  registerTab: (id: string, value: string) => () => void;
  registerPanel: (id: string, value: string) => () => void;
  getPanelId: (value: string) => string | undefined;
  getTabId: (value: string) => string | undefined;
  selected?: string;
  setSelected: (event: SyntheticEvent, value: string) => void;
  active?: string;
  setActive: (value: string) => void;
}

export const TabsNextContext = createContext<TabsNextContextValue>(
  "TabsNextContext",
  {
    registerTab: () => () => undefined,
    registerPanel: () => () => undefined,
    getPanelId: () => undefined,
    getTabId: () => undefined,
    setSelected: () => undefined,
    setActive: () => undefined,
  },
);

export function useTabsNext() {
  return useContext(TabsNextContext);
}
