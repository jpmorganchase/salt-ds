import { createContext } from "@salt-ds/core";
import { useContext } from "react";

interface TabNextContextValue {
  tabId?: string;
  focused: boolean;
  selected: boolean;
  value: string;
  disabled: boolean;
}

export const TabNextContext = createContext<TabNextContextValue>(
  "TabNextContext",
  {
    focused: false,
    selected: false,
    disabled: false,
    value: "",
  },
);

export function useTabNext() {
  return useContext(TabNextContext);
}
