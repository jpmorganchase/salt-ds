import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";

export type AccordionGroupProps = ComponentPropsWithoutRef<"div">;

const withBaseName = makePrefixer("saltAccordionGroup");

export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  function AccordionGroup(props, ref) {
    const { className, ...rest } = props;

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest} />
    );
  }
);
