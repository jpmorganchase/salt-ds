import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tableCss from "./Table.css";

export type TableProps = ComponentPropsWithoutRef<'tbody'>;

const withBaseName = makePrefixer("saltTable-tbody");

export const TBody = forwardRef<HTMLTableSectionElement, TableProps>(
  function TBody({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-tbody",
    css: tableCss,
    window: targetWindow,
  });

  return (
    <tbody
        ref={ref} 
        className={clsx(withBaseName(), className)}
        {...rest}
    >
      {children}
    </tbody>
  );
});
