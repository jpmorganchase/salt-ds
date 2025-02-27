import clsx from "clsx";
import { StackLayout, useControlled } from "@salt-ds/core";
import "./CustomAccordion.css";
import { ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";

export const CustomAccordion = ({
                                  header,
                                  content,
                                  defaultExpanded = true,
                                  variant = "primary",
                                  gap = 2,
                                  className,
                                  disableCollapse,
                                }: {
  header: ReactNode;
  content: ReactNode;
  defaultExpanded?: boolean;
  /** Changes header background color, padding, etc. */
  variant?: "primary" | "secondary";
  /** Stack layout gap. Default to 2 */
  gap?: number;
  className?: string;
  disableCollapse?: boolean;
}) => {
  const [expanded, setExpanded] = useControlled({
    default: defaultExpanded,
    name: "CustomAccordion",
    state: "expanded",
  });
  const Element = disableCollapse ? "div" : "button";
  return (
    <StackLayout
      className={clsx(
        "CustomAccordion",
        `CustomAccordion-${variant}`,
        className
      )}
      gap={gap}
    >
      <Element
        className={clsx("CustomAccordion-header", {
          "CustomAccordion-header-actionable": !disableCollapse,
        })}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="CustomAccordion-headerContainer">{header}</div>
        {disableCollapse ? null : expanded ? (
          <ChevronUpIcon
            className="CustomAccordion-header-collapse"
            aria-label="Collapse accordion"
          />
        ) : (
          <ChevronDownIcon
            className="CustomAccordion-header-expand"
            aria-label="Expand accordion"
          />
        )}
      </Element>
      {disableCollapse || expanded ? content : null}
    </StackLayout>
  );
};
