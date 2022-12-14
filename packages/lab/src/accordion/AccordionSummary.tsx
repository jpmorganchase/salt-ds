import {
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  ReactNode,
  useCallback,
} from "react";
import cn from "classnames";
import { makePrefixer } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useAccordionSectionContext } from "./AccordionSectionContext";
import "./Accordion.css";

const withBaseName = makePrefixer("saltAccordionSummary");

export interface AccordionSummaryProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
}

export const AccordionSummary = forwardRef<
  HTMLDivElement,
  AccordionSummaryProps
>(function AccordionSummary({ className, children, icon, ...restProps }, ref) {
  const { isDisabled, isExpanded, onToggle } = useAccordionSectionContext();

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    ({ key }) => {
      if (key === "Enter" || key === " ") {
        onToggle();
      }
    },
    [onToggle]
  );

  if (!icon) {
    icon = <ChevronRightIcon aria-hidden />;
  }

  return (
    <div
      {...restProps}
      className={cn(
        withBaseName(),
        {
          [withBaseName("disabled")]: isDisabled,
          [withBaseName("expanded")]: isExpanded,
        },
        className
      )}
      ref={ref}
      role="button"
      aria-expanded={isExpanded}
      onClick={isDisabled ? undefined : onToggle}
      onKeyDown={isDisabled ? undefined : onKeyDown}
      tabIndex={isDisabled ? -1 : 0}
    >
      <div className={withBaseName("icon")}>{icon}</div>
      {children}
    </div>
  );
});
