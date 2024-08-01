import { type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";

export interface AccordionContextValue {
  value: string;
  expanded: boolean;
  toggle: (event: SyntheticEvent<HTMLButtonElement>) => void;
  disabled: boolean;
  indicatorSide: "left" | "right";
  headerId: string;
  setHeaderId: (id: string) => void;
  panelId: string;
  setPanelId: (id: string) => void;
  status?: "error" | "warning" | "success";
}

export const AccordionContext = createContext<AccordionContextValue>(
  "AccordionContext",
  {
    value: "",
    expanded: false,
    toggle: () => undefined,
    disabled: false,
    indicatorSide: "left",
    headerId: "",
    setHeaderId: () => undefined,
    panelId: "",
    setPanelId: () => undefined,
  },
);

export function useAccordion() {
  return useContext(AccordionContext);
}
