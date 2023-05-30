import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface AccordionContextValue {
  value: string;
  expanded: boolean;
  toggle: (event: SyntheticEvent<HTMLButtonElement>) => void;
  disabled: boolean;
  id: string;
}

export const AccordionContext = createContext<AccordionContextValue>(
  "AccordionContext",
  {
    value: "",
    expanded: false,
    toggle: () => {},
    disabled: false,
    id: "",
  }
);

export function useAccordion() {
  return useContext(AccordionContext);
}
