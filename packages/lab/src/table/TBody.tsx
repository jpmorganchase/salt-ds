import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type TableProps = ComponentPropsWithoutRef<'tbody'>;

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
        className={clsx(withTableBaseName('tbody'), className)}
        {...rest}
    >
      {children}
    </tbody>
  );
});
