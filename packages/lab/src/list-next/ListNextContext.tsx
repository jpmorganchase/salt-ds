import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface ListItemNextContextValue {
  disabled?: boolean;
  id?: string | undefined;
  select: (event: SyntheticEvent<HTMLLIElement>) => void;
  isSelected: (id: string) => boolean;
  isFocused: (id: string) => boolean;
}

export const ListItemNextContext = createContext<
  ListItemNextContextValue | undefined
>("ListItemNextContext", undefined);

export function useListItems() {
  return useContext(ListItemNextContext);
}
