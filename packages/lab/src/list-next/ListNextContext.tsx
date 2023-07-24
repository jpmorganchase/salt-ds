import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface ListNextContextValue {
  disabled?: boolean;
  id?: string;
  select: (event: SyntheticEvent<HTMLLIElement>) => void;
  isSelected: (value: string) => boolean;
  isFocused: (value: string) => boolean;
  highlight: (event: SyntheticEvent<HTMLLIElement>) => void;
  isHighlighted: (id: string) => boolean;
}

export const ListNextContext = createContext<ListNextContextValue | undefined>(
  "ListNextContext",
  undefined
);

export function useListItem() {
  return useContext(ListNextContext);
}
