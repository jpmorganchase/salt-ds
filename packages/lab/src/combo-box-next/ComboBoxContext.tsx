import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface ComboBoxContextValue {
  inputValue?: string;
  setInputValue: () => void;
  open?: boolean;
}

export const ComboBoxContext = createContext("ComboBoxContext", undefined);

export function useComboBoxContext() {
  return useContext(ComboBoxContext);
}
