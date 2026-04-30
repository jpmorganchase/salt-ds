import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface TabSlotRegistryContextValue {
  registerSlot: (slotId: string, element: HTMLDivElement | null) => void;
}

export const TabSlotRegistryContext =
  createContext<TabSlotRegistryContextValue | null>(
    "TabSlotRegistryContext",
    null,
  );

export function useTabSlotRegistry() {
  return useContext(TabSlotRegistryContext);
}
