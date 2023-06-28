import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface ListNextContextValue {
  disabled: boolean;
  id?: string;
  select: (event: SyntheticEvent<HTMLLIElement>) => void;
  isSelected: (id: string) => boolean;
  isFocused: (id: string) => boolean;
}

export const ListNextContext = createContext<
  ListNextContextValue | undefined
>("ListNextContext", undefined);

export function useListItems() {
  return useContext(ListNextContext);
}
