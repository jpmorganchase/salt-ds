import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface ComboBoxContextValue {
  value?: string;
}

export const ComboBoxContext = createContext("ComboBoxContext", undefined);

export function useComboBoxContext() {
  return useContext(ComboBoxContext);
}
