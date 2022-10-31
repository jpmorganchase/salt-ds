import { ReactNode } from "react";

import "./CustomSummary.css";
import { useAccordionSectionContext } from "@jpmorganchase/uitk-lab";
import { ChevronDownIcon, ChevronUpIcon } from "@jpmorganchase/uitk-icons";

export const CustomSummary = ({ children }: { children?: ReactNode }) => {
  const { isDisabled, isExpanded, onToggle } = useAccordionSectionContext();

  return (
    <div
      className="custom-accordion-summary"
      onClick={isDisabled ? undefined : onToggle}
      tabIndex={0}
    >
      <div className={"content"}>{children}</div>
      {isExpanded ? (
        <ChevronUpIcon className="custom-accordion-summary-icon" />
      ) : (
        <ChevronDownIcon className="custom-accordion-summary-icon" />
      )}
    </div>
  );
};
