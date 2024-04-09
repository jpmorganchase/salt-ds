import { createContext } from "@salt-ds/core";
import { ReactNode, SyntheticEvent, useContext } from "react";

interface TabValue {
  value: string;
  label: ReactNode;
}

export interface TabsContextValue {
  activeColor: "primary" | "secondary";
  disabled?: boolean;
  activate: (event: SyntheticEvent<HTMLButtonElement>) => void;
  isActive: (id: string) => boolean;
  setFocusable: (id: string) => void;
  isFocusable: (id: string) => boolean;
  registerTab: (tab: TabValue) => void;
  unregisterTab: (id: string) => void;
  variant: "main" | "inline";
}

export const TabsContext = createContext<TabsContextValue>("TabsContext", {
  activeColor: "primary",
  disabled: false,
  activate: () => undefined,
  isActive: () => false,
  setFocusable: () => undefined,
  isFocusable: () => false,
  registerTab: () => undefined,
  unregisterTab: () => undefined,
  variant: "main",
});

export function useTabs() {
  return useContext(TabsContext);
}
