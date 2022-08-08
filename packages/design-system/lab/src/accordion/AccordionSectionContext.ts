import { createContext, useContext } from "react";
import { isNotProduction } from "./utils";

export interface AccordionSectionContext {
  isDisabled?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const AccordionSectionContext = createContext<
  AccordionSectionContext | undefined
>(undefined);

if (isNotProduction()) {
  AccordionSectionContext.displayName = "AccordionSectionContext";
}

export const useAccordionSectionContext = () => {
  const context = useContext(AccordionSectionContext);
  if (isNotProduction() && !context) {
    console.error(
      "useAccordionSectionContext should be used inside of AccordionSection"
    );
  }
  return context!;
};
