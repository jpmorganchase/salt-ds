import { useContext } from "react";
import { createContext } from "../../../utils";

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
