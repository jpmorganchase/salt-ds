import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tableCss from "./Table.css";

export type TableProps = ComponentPropsWithoutRef<'thead'>;

const withBaseName = makePrefixer("saltTable-thead");

export const THead = forwardRef<HTMLTableSectionElement, TableProps>(
  function THead({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-thead",
    css: tableCss,
    window: targetWindow,
  });

  return (
    <thead
        ref={ref} 
        className={clsx(withBaseName(), className)}
        {...rest}
    >
      {children}
    </thead>
  );
});
