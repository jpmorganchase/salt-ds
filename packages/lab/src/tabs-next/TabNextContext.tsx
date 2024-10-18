import { createContext } from "@salt-ds/core";
import { useContext } from "react";

interface TabNextContextValue {
  tabId?: string;
  focused: boolean;
  selected: boolean;
  value: string;
  disabled: boolean;
  actions: string[];
  registerAction: (id: string) => () => void;
}

export const TabNextContext = createContext<TabNextContextValue>(
  "TabNextContext",
  {
    focused: false,
    selected: false,
    disabled: false,
    value: "",
    actions: [],
    registerAction: () => () => undefined,
  },
);

export function useTabNext() {
  return useContext(TabNextContext);
}
