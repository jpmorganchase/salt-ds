import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export type TabSlotLocation = "hidden" | "main" | "overflow";

export interface TabListLayoutContextValue {
  getLocation: (value: string) => TabSlotLocation;
  overflowActiveValue: string | null;
  setOverflowActiveValue: (value: string | null) => void;
  moveOverflowFocus: (
    key: "ArrowDown" | "ArrowUp" | "Home" | "End",
    value: string,
  ) => boolean;
}

export const TabListLayoutContext =
  createContext<TabListLayoutContextValue | null>("TabListLayoutContext", null);

export function useTabListLayout() {
  return useContext(TabListLayoutContext);
}
