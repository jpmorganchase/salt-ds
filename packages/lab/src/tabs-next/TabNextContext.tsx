import { createContext } from "@salt-ds/core";
import { ReactNode, SyntheticEvent, useContext } from "react";

type TabValue = {
  value: string;
  label: ReactNode;
};

export interface TabsContextValue {
  disabled?: boolean;
  select: (event: SyntheticEvent<HTMLButtonElement>) => void;
  isSelected: (id: string) => boolean;
  focus: (id: string) => void;
  isFocused: (id: string) => boolean;
  registerTab: (tab: TabValue) => void;
  unregisterTab: (id: string) => void;
}

export const TabsContext = createContext<TabsContextValue>("TabsContext", {
  disabled: false,
  select: () => undefined,
  isSelected: () => false,
  focus: () => undefined,
  isFocused: () => false,
  registerTab: () => undefined,
  unregisterTab: () => undefined,
});

export function useTabs() {
  return useContext(TabsContext);
}
