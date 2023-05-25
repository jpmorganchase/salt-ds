import {
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  ReactNode,
  useCallback,
} from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useAccordionSectionContext } from "./AccordionSectionContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import accordionCss from "./Accordion.css";

const withBaseName = makePrefixer("saltAccordionSummary");

export interface AccordionSummaryProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
}

export const AccordionSummary = forwardRef<
  HTMLDivElement,
  AccordionSummaryProps
>(function AccordionSummary({ className, children, icon, ...restProps }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-accordion",
    css: accordionCss,
    window: targetWindow,
  });

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
      className={clsx(
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
