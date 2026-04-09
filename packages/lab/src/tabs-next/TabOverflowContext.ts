import { createContext } from "@salt-ds/core";
import { type KeyboardEvent, useContext } from "react";

export interface TabOverflowContextValue {
  activeIndex: number | null;
  handleItemFocus: (index: number | null | undefined) => void;
  handleItemKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number | null | undefined,
  ) => void;
}

export const TabOverflowContext = createContext<TabOverflowContextValue | null>(
  "TabOverflowContext",
  null,
);

export function useTabOverflow() {
  return useContext(TabOverflowContext);
}
