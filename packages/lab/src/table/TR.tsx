import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type TRProps = ComponentPropsWithoutRef<"tr">;

export const TR = forwardRef<HTMLTableRowElement, TRProps>(
  function TR({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-tr",
    css: tableCss,
    window: targetWindow,
  });
    
    return (
      <tr
        ref={ref} 
        className={clsx(withTableBaseName('tr'), className)}
        {...rest}
      >
        {children}
      </tr>
    );
  },
);
