import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { makePrefixer, useIsomorphicLayoutEffect } from "../utils";
import { useAccordion } from "./AccordionContext";
import accordionPanelCss from "./AccordionPanel.css?inline";

export interface AccordionPanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the Accordion Panel
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltAccordionPanel");

export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel(props, ref) {
    const { children, className, id, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-accordion-panel",
      css: accordionPanelCss,
      window: targetWindow,
    });

    const { headerId, panelId, setPanelId, expanded, indicatorSide } =
      useAccordion();

    useIsomorphicLayoutEffect(() => {
      if (id) {
        setPanelId(id);
      }
    }, [id, setPanelId]);

    return (
      <div
        ref={ref}
        className={clsx(withBaseName(), className)}
        role="region"
        id={panelId}
        aria-labelledby={headerId}
        aria-hidden={!expanded ? "true" : undefined}
        hidden={!expanded}
        {...rest}
      >
        <div className={withBaseName("inner")}>
          <div
            className={clsx(withBaseName("content"), {
              [withBaseName("indentedContent")]: indicatorSide === "left",
            })}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
