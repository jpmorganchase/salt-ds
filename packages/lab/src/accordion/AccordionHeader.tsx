import { ComponentPropsWithoutRef, forwardRef, MouseEvent } from "react";
import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { useAccordion } from "./AccordionContext";
import accordionHeaderCss from "./AccordionHeader.css";

export interface AccordionHeaderProps
  extends ComponentPropsWithoutRef<"button"> {}

const withBaseName = makePrefixer("saltAccordionHeader");

export const AccordionHeader = forwardRef<
  HTMLButtonElement,
  AccordionHeaderProps
>(function AccordionHeader(props, ref) {
  const { children, className, onClick, ...rest } = props;
  const { value, expanded, toggle, disabled, id } = useAccordion();

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
      className={clsx(withBaseName(), className)}
      disabled={disabled}
      onClick={handleClick}
      aria-expanded={expanded}
      id={`${id}-header`}
      aria-controls={`${id}-panel`}
      value={value}
      {...rest}
    >
      <ChevronRightIcon aria-hidden="true" className={withBaseName("icon")} />
      {children}
    </button>
  );
});
