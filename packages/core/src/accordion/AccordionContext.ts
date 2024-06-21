import { SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";

export interface AccordionContextValue {
  value: string;
  expanded: boolean;
  toggle: (event: SyntheticEvent<HTMLButtonElement>) => void;
  disabled: boolean;
  arrowAlignment: "left" | "right";
  id: string;
  status?: "error" | "warning" | "success";
}

export const AccordionContext = createContext<AccordionContextValue>(
  "AccordionContext",
  {
    value: "",
    expanded: false,
    toggle: () => undefined,
    disabled: false,
    arrowAlignment: "left",
    id: "",
  }
);

export function useAccordion() {
  return useContext(AccordionContext);
}
