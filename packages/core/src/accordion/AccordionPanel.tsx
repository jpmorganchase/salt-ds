import { ComponentPropsWithoutRef, forwardRef, useEffect, useRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { clsx } from "clsx";

import { makePrefixer, useForkRef } from "../utils";
import { useAccordion } from "./AccordionContext";
import accordionPanelCss from "./AccordionPanel.css";

export type AccordionPanelProps = ComponentPropsWithoutRef<"div">;

const withBaseName = makePrefixer("saltAccordionPanel");

export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel(props, ref) {
    const { children, className, ...rest } = props;

    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(ref, panelRef);

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-accordion-panel",
      css: accordionPanelCss,
      window: targetWindow,
    });

    const innerRef = useRef<HTMLDivElement>(null);

    const { id, expanded } = useAccordion();

    useEffect(() => {
      const panel = panelRef.current;
      if (!panel) return;

      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target === panel && expanded && innerRef.current) {
          innerRef.current.style.overflow = "visible";
        }
      };
      const handleTransitionStart = (event: TransitionEvent) => {
        if (event.target === panel && !expanded && innerRef.current) {
          innerRef.current.style.overflow = "hidden";
        }
      };
      panel.addEventListener("transitionend", handleTransitionEnd);
      panel.addEventListener("transitionstart", handleTransitionStart);

      return () => {
        panel.removeEventListener("transitionend", handleTransitionEnd);
        panel.removeEventListener("transitionstart", handleTransitionStart);
      };
    }, [expanded]);

    return (
      <div
        ref={handleRef}
        className={clsx(withBaseName(), className)}
        role="region"
        id={`${id}-panel`}
        aria-labelledby={`${id}-header`}
        aria-hidden={!expanded ? "true" : undefined}
        hidden={!expanded}
        {...rest}
      >
        <div className={withBaseName("inner")} ref={innerRef}>
          <div className={withBaseName("content")}>{children}</div>
        </div>
      </div>
    );
  }
);
