import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface DropdownNextContextValue {
  valueSelected?: string;
}

export const DropdownNextContext = createContext(
  "DropdownNextContext",
  undefined
);

export function useDropdownNextContext() {
  return useContext(DropdownNextContext);
}
