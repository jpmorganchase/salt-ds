import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  forwardRef,
} from "react";
import { StatusIndicator } from "../status-indicator";

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

function ExpansionIcon({ expanded }: { expanded: boolean }) {
  if (expanded) {
    return <ChevronUpIcon aria-hidden className={withBaseName("icon")} />;
  }

  return <ChevronDownIcon aria-hidden className={withBaseName("icon")} />;
}

export const AccordionHeader = forwardRef<
  HTMLButtonElement,
  AccordionHeaderProps
>(function AccordionHeader(props, ref) {
  const { children, className, onClick, ...rest } = props;
  const { value, expanded, toggle, indicatorSide, disabled, id, status } =
    useAccordion();

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
        className,
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
      {indicatorSide === "left" && <ExpansionIcon expanded={expanded} />}
      <span className={withBaseName("content")}>{children}</span>
      {status && (
        <StatusIndicator
          className={withBaseName("statusIndicator")}
          status={status}
        />
      )}
      {indicatorSide === "right" && <ExpansionIcon expanded={expanded} />}
    </button>
  );
});
