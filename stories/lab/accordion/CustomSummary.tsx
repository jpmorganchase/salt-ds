import { FC } from "react";

import "./CustomSummary.css";
import { useAccordionSectionContext } from "@brandname/lab";

const PlusIcon = () => (
  <div className="plus icon">
    <div>
      <div />
      <div />
    </div>
  </div>
);

const MinusIcon = () => (
  <div className="minus icon">
    <div>
      <div />
    </div>
  </div>
);

export const CustomSummary: FC = ({ children }) => {
  const { isDisabled, isExpanded, onToggle } = useAccordionSectionContext();

  return (
    <div
      className={"custom-accordion-summary"}
      onClick={isDisabled ? undefined : onToggle}
      tabIndex={0}
    >
      <div className={"content"}>{children}</div>
      {isExpanded ? <MinusIcon /> : <PlusIcon />}
    </div>
  );
};
