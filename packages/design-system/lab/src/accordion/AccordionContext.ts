import { createContext, useContext } from "react";
import { isNotProduction } from "./utils";

export interface AccordionContext {
  isExpanded: (id: string) => boolean;
  disabled: boolean;
  registerSection: (id: string, isExpanded: boolean) => void;
  unregisterSection: (id: string) => void;
  onChange: (id: string, isExpanded: boolean) => void;
}

export const AccordionContext = createContext<AccordionContext | undefined>(
  undefined
);

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (isNotProduction() && !context) {
    console.error("useAccordionContext should be used inside of Accordion");
  }
  return context!;
};
