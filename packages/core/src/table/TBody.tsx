import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface TBodyProps extends ComponentPropsWithoutRef<"tbody"> {}

export const TBody = forwardRef<HTMLTableSectionElement, TBodyProps>(
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
        className={clsx(withTableBaseName("tbody"), className)}
        {...rest}
      >
        {children}
      </tbody>
    );
  },
);
