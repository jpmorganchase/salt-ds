import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  ReactNode,
} from "react";
import { clsx } from "clsx";
import { StatusIndicator } from "../status-indicator";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { makePrefixer } from "../utils";

import { useAccordion } from "./AccordionContext";
import accordionHeaderCss from "./AccordionHeader.css";

export interface AccordionHeaderProps
  extends ComponentPropsWithoutRef<"button"> {
  /**
   * The content of the Accordion Header
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltAccordionHeader");

export const AccordionHeader = forwardRef<
  HTMLButtonElement,
  AccordionHeaderProps
>(function AccordionHeader(props, ref) {
  const { children, className, onClick, ...rest } = props;
  const { value, expanded, toggle, disabled, id, status } = useAccordion();

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-accordion-header",
    css: accordionHeaderCss,
    window: targetWindow,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    toggle(event);
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      className={clsx(
        withBaseName(),
        { [withBaseName(status ?? "")]: status },
        className
      )}
      disabled={disabled}
      onClick={handleClick}
      aria-expanded={expanded}
      id={`${id}-header`}
      aria-controls={`${id}-panel`}
      value={value}
      type="button"
      {...rest}
    >
      <ChevronRightIcon aria-hidden="true" className={withBaseName("icon")} />
      {children}
      {status && (
        <StatusIndicator
          className={withBaseName("statusIndicator")}
          status={status}
        />
      )}
    </button>
  );
});
