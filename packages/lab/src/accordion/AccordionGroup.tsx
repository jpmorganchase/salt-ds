import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
export interface AccordionGroupProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltAccordionGroup");

export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  function AccordionGroup(props, ref) {
    const { className, ...rest } = props;

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest} />
    );
  }
);
