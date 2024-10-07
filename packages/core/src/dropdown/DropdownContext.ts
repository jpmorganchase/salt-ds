import type { useInteractions } from "@floating-ui/react";
import { type RefObject, useContext } from "react";
import { type UseFloatingUIReturn, createContext } from "../utils";

type UseInteractionsReturn = ReturnType<typeof useInteractions>;

export interface DropdownContextValue
  extends Pick<UseInteractionsReturn, "getFloatingProps">,
    Partial<Pick<UseFloatingUIReturn, "refs" | "elements">> {
  openState: boolean;
  focusedState: boolean;
  readOnly?: boolean;
  setListId: (id: string) => void;
  getPopoverPosition: () => Record<string, unknown>;
  setFocusVisibleState: (state: boolean) => void;
  listRef: RefObject<HTMLDivElement>;
}

export const DropdownContext = createContext<DropdownContextValue>(
  "DropdownContext",
  {
    getFloatingProps: () => ({}),
    getPopoverPosition: () => ({}),
    openState: false,
    focusedState: false,
    readOnly: false,
    setListId: () => {},
    setFocusVisibleState: () => {},
    listRef: { current: null },
  },
);

export function useDropdownContext() {
  return useContext(DropdownContext);
}
