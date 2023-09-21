import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import accordionGroupCss from "./AccordionGroup.css";

export interface AccordionGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The child Accordions to be rendered
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltAccordionGroup");

export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  function AccordionGroup(props, ref) {
    const { className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-accordion-group",
      css: accordionGroupCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest} />
    );
  }
);
