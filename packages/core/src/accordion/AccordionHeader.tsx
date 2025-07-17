import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { StatusIndicator } from "../status-indicator";
import { makePrefixer, useIsomorphicLayoutEffect } from "../utils";

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
  const { CollapseIcon, ExpandIcon } = useIcon();
  if (expanded) {
    return <CollapseIcon aria-hidden className={withBaseName("icon")} />;
  }

  return <ExpandIcon aria-hidden className={withBaseName("icon")} />;
}

export const AccordionHeader = forwardRef<
  HTMLButtonElement,
  AccordionHeaderProps
>(function AccordionHeader(props, ref) {
  const { children, className, onClick, id, ...rest } = props;
  const {
    value,
    expanded,
    toggle,
    indicatorSide,
    disabled,
    headerId,
    panelId,
    setHeaderId,
    status,
  } = useAccordion();

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

  useIsomorphicLayoutEffect(() => {
    if (id) {
      setHeaderId(id);
    }
  }, [id, setHeaderId]);

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
      id={headerId}
      aria-controls={panelId}
      value={value}
      type="button"
      {...rest}
    >
      {indicatorSide === "left" && <ExpansionIcon expanded={expanded} />}
      <span className={withBaseName("content")}>{children}</span>
      {status && !disabled && (
        <StatusIndicator
          className={withBaseName("statusIndicator")}
          status={status}
        />
      )}
      {indicatorSide === "right" && <ExpansionIcon expanded={expanded} />}
    </button>
  );
});
