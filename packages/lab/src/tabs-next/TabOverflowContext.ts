import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface TabOverflowContextValue {
  activeIndex: number | null;
  getItemProps: (props: any) => Record<string, unknown>;
}

export const TabOverflowContext = createContext<TabOverflowContextValue | null>(
  "TabOverflowContext",
  null,
);

export function useTabOverflow() {
  return useContext(TabOverflowContext);
}
