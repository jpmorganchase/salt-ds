import { useContext } from "react";
import { createContext } from "../../../utils";

interface TabContextValue {
  tabId?: string;
  focused: boolean;
  selected: boolean;
  value: string;
  disabled: boolean;
  actions: string[];
  registerAction: (id: string) => () => void;
}

export const TabContext = createContext<TabContextValue>("TabContext", {
  focused: false,
  selected: false,
  disabled: false,
  value: "",
  actions: [],
  registerAction: () => () => undefined,
});

export function useTab() {
  return useContext(TabContext);
}
