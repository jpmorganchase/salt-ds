import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { clsx } from "clsx";

import { useAccordion } from "./AccordionContext";
import accordionPanelCss from "./AccordionPanel.css";

export interface AccordionPanelProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltAccordionPanel");

export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel(props, ref) {
    const { children, className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-accordion-panel",
      css: accordionPanelCss,
      window: targetWindow,
    });

    const { id, expanded } = useAccordion();

    return (
      <div
        ref={ref}
        className={clsx(withBaseName(), className)}
        role="region"
        id={`${id}-panel`}
        aria-labelledby={`${id}-header`}
        aria-hidden={!expanded ? "true" : undefined}
        {...rest}
      >
        <div className={withBaseName("inner")}>
          <div className={withBaseName("content")}>{children}</div>
        </div>
      </div>
    );
  }
);
