import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface TabsNextContextValue {
  registerTab: (id: string, value: string) => () => void;
  registerPanel: (id: string, value: string) => () => void;
  getPanelId: (value: string) => string | undefined;
  getTabId: (value: string) => string | undefined;
  selectedTab?: string;
  setSelectedTab: (value: string | undefined) => void;
}

export const TabsNextContext = createContext<TabsNextContextValue>(
  "TabsNextContext",
  {
    registerTab: () => () => undefined,
    registerPanel: () => () => undefined,
    getPanelId: () => undefined,
    getTabId: () => undefined,
    setSelectedTab: () => undefined,
  },
);

export function useTabsNext() {
  return useContext(TabsNextContext);
}
